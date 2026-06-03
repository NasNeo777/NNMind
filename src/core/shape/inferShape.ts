import { getIncomingEdges, topologicalSort } from "../graph/utils"
import type {
  GraphIssue,
  InferenceResult,
  LayerNode,
  NeuralGraph,
  TensorDim,
  TensorShape,
  TensorSpec,
} from "../graph/types"
import { coerceDtype, getLayerDef } from "../registry/layerRegistry"

function expectInput(input: TensorSpec | null | undefined, layerName: string, portName = "in"): TensorSpec {
  if (!input) {
    throw new Error(`${layerName} 缺少 ${portName} 输入张量。`)
  }

  return input
}

function asNumber(value: unknown, fallback: number): number {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value
  }

  return fallback
}

function asTuple(value: unknown, fallback: [number, number]): [number, number] {
  if (Array.isArray(value) && value.length >= 2) {
    return [asNumber(value[0], fallback[0]), asNumber(value[1], fallback[1])]
  }

  return fallback
}

function asShapeTuple(value: unknown, fallback: number[]): number[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((item, index) => asNumber(item, fallback[index] ?? fallback[fallback.length - 1] ?? 1))
  }

  return fallback
}

function shapesEqual(left: TensorShape, right: TensorShape): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function multiplyDims(dims: TensorDim[]): number | null {
  let total = 1

  for (const dim of dims) {
    if (typeof dim !== "number") {
      return null
    }

    total *= dim
  }

  return total
}

function inferInput(node: LayerNode): TensorSpec {
  const shape = Array.isArray(node.params.shape) ? node.params.shape : ["B", 3, 224, 224]

  return {
    dtype: coerceDtype(node.params.dtype),
    shape: shape.map((dim) => (typeof dim === "number" ? dim : dim === "B" ? "B" : null)),
  }
}

function inferEmbedding(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length < 1 || input.shape.length > 2) {
    throw new Error("Embedding 需要 1D 或 2D token tensor。")
  }

  const embedDim = asNumber(node.params.embedding_dim, 512)

  return {
    dtype: "float32",
    shape: [...input.shape, embedDim],
  }
}

function inferConv2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("Conv2d 需要 4D Tensor: [B, C, H, W]")
  }

  const [batch, channels, height, width] = input.shape
  const [kernelH, kernelW] = asTuple(node.params.kernel_size, [3, 3])
  const [strideH, strideW] = asTuple(node.params.stride, [1, 1])
  const [paddingH, paddingW] = asTuple(node.params.padding, [1, 1])
  const [dilationH, dilationW] = asTuple(node.params.dilation, [1, 1])
  const inChannels = asNumber(node.params.in_channels, 3)
  const outChannels = asNumber(node.params.out_channels, 32)

  if (channels !== inChannels) {
    throw new Error(`Conv2d 输入通道不匹配: 需要 ${inChannels}, 实际 ${String(channels)}`)
  }

  const outputHeight =
    typeof height === "number"
      ? Math.floor((height + 2 * paddingH - dilationH * (kernelH - 1) - 1) / strideH + 1)
      : null
  const outputWidth =
    typeof width === "number"
      ? Math.floor((width + 2 * paddingW - dilationW * (kernelW - 1) - 1) / strideW + 1)
      : null

  if ((typeof outputHeight === "number" && outputHeight <= 0) || (typeof outputWidth === "number" && outputWidth <= 0)) {
    throw new Error("Conv2d 推导结果无效，请检查 kernel / stride / padding。")
  }

  return {
    dtype: input.dtype,
    shape: [batch, outChannels, outputHeight, outputWidth],
  }
}

function inferResidualBlock2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("ResidualBlock2d 需要 4D Tensor。")
  }

  const [batch, channels, height, width] = input.shape
  const inChannels = asNumber(node.params.in_channels, 64)
  const outChannels = asNumber(node.params.out_channels, 64)
  const stride = asNumber(node.params.stride, 1)
  const useProjection = asBoolean(node.params.use_projection, false)

  if (channels !== inChannels) {
    throw new Error(`ResidualBlock2d 输入通道不匹配: 需要 ${inChannels}, 实际 ${String(channels)}`)
  }

  if (!useProjection && inChannels !== outChannels && stride === 1) {
    throw new Error("ResidualBlock2d 若不使用 projection，输入输出通道必须一致。")
  }

  return {
    dtype: input.dtype,
    shape: [
      batch,
      outChannels,
      typeof height === "number" ? Math.floor(height / stride) : null,
      typeof width === "number" ? Math.floor(width / stride) : null,
    ],
  }
}

function inferBatchNorm2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("BatchNorm2d 需要 4D Tensor。")
  }

  const features = asNumber(node.params.num_features, 32)

  if (input.shape[1] !== features) {
    throw new Error(`BatchNorm2d 特征数不匹配: 需要 ${features}, 实际 ${String(input.shape[1])}`)
  }

  return input
}

function inferLayerNorm(node: LayerNode, input: TensorSpec): TensorSpec {
  const normalizedShape = asShapeTuple(node.params.normalized_shape, [input.shape[input.shape.length - 1] as number])

  if (normalizedShape.length > input.shape.length) {
    throw new Error("LayerNorm normalized_shape 不能超过输入 rank。")
  }

  const trailingShape = input.shape.slice(input.shape.length - normalizedShape.length)

  trailingShape.forEach((dim, index) => {
    const expected = normalizedShape[index]

    if (typeof dim === "number" && dim !== expected) {
      throw new Error(`LayerNorm 尾部 shape 不匹配: 需要 ${normalizedShape.join("x")}。`)
    }
  })

  return input
}

function inferIdentity(input: TensorSpec): TensorSpec {
  return input
}

function inferMaxPool2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("MaxPool2d 需要 4D Tensor。")
  }

  const [batch, channels, height, width] = input.shape
  const [kernelH, kernelW] = asTuple(node.params.kernel_size, [2, 2])
  const [strideH, strideW] = asTuple(node.params.stride, [2, 2])
  const [paddingH, paddingW] = asTuple(node.params.padding, [0, 0])

  return {
    dtype: input.dtype,
    shape: [
      batch,
      channels,
      typeof height === "number" ? Math.floor((height + 2 * paddingH - kernelH) / strideH + 1) : null,
      typeof width === "number" ? Math.floor((width + 2 * paddingW - kernelW) / strideW + 1) : null,
    ],
  }
}

function inferAdaptiveAvgPool2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("AdaptiveAvgPool2d 需要 4D Tensor。")
  }

  const [batch, channels] = input.shape
  const [outH, outW] = asTuple(node.params.output_size, [1, 1])

  return {
    dtype: input.dtype,
    shape: [batch, channels, outH, outW],
  }
}

function inferPatchEmbedding(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("PatchEmbedding 需要 4D 图像张量。")
  }

  const [batch, channels, height, width] = input.shape
  const inChannels = asNumber(node.params.in_channels, 3)
  const embedDim = asNumber(node.params.embed_dim, 768)
  const [patchH, patchW] = asTuple(node.params.patch_size, [14, 14])

  if (channels !== inChannels) {
    throw new Error(`PatchEmbedding 输入通道不匹配: 需要 ${inChannels}, 实际 ${String(channels)}`)
  }

  if (typeof height === "number" && height % patchH !== 0) {
    throw new Error("PatchEmbedding 需要高度可以被 patch size 整除。")
  }

  if (typeof width === "number" && width % patchW !== 0) {
    throw new Error("PatchEmbedding 需要宽度可以被 patch size 整除。")
  }

  const patchCount =
    typeof height === "number" && typeof width === "number"
      ? (height / patchH) * (width / patchW)
      : null

  return {
    dtype: "float32",
    shape: [batch, patchCount, embedDim],
  }
}

function inferTokenPool(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 3) {
    throw new Error("TokenPool 需要 3D token 序列。")
  }

  const [batch, tokenCount, embedDim] = input.shape
  const mode = node.params.mode

  if (mode === "cls" && typeof tokenCount === "number" && tokenCount < 1) {
    throw new Error("TokenPool(cls) 至少需要一个 token。")
  }

  return {
    dtype: input.dtype,
    shape: [batch, embedDim],
  }
}

function inferFlatten(node: LayerNode, input: TensorSpec): TensorSpec {
  const startDim = asNumber(node.params.start_dim, 1)
  const endDimRaw = asNumber(node.params.end_dim, -1)
  const endDim = endDimRaw < 0 ? input.shape.length + endDimRaw : endDimRaw

  if (startDim < 0 || endDim >= input.shape.length || startDim > endDim) {
    throw new Error("Flatten 维度范围无效。")
  }

  const before = input.shape.slice(0, startDim)
  const middle = input.shape.slice(startDim, endDim + 1)
  const after = input.shape.slice(endDim + 1)
  const features = multiplyDims(middle)

  return {
    dtype: input.dtype,
    shape: [...before, features, ...after],
  }
}

function inferLinear(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length < 2) {
    throw new Error("Linear 至少需要 2D Tensor。")
  }

  const inFeatures = asNumber(node.params.in_features, 128)
  const outFeatures = asNumber(node.params.out_features, 10)
  const lastDim = input.shape[input.shape.length - 1]

  if (lastDim !== inFeatures) {
    throw new Error(`Linear 输入特征不匹配: 需要 ${inFeatures}, 实际 ${String(lastDim)}`)
  }

  return {
    dtype: input.dtype,
    shape: [...input.shape.slice(0, -1), outFeatures],
  }
}

function inferDropout(input: TensorSpec): TensorSpec {
  return input
}

function inferRecurrent(node: LayerNode, input: TensorSpec, kind: "LSTM" | "GRU"): TensorSpec {
  if (input.shape.length !== 3) {
    throw new Error(`${kind} 需要 3D 序列输入。`)
  }

  const batchFirst = asBoolean(node.params.batch_first, true)
  const inputSize = asNumber(node.params.input_size, 300)
  const hiddenSize = asNumber(node.params.hidden_size, 256)
  const bidirectional = asBoolean(node.params.bidirectional, false)
  const returnSequences = asBoolean(node.params.return_sequences, false)
  const directionMultiplier = bidirectional ? 2 : 1
  const sequenceDim = batchFirst ? input.shape[1] : input.shape[0]
  const featureDim = batchFirst ? input.shape[2] : input.shape[1]
  const batchDim = batchFirst ? input.shape[0] : input.shape[1]

  if (featureDim !== inputSize) {
    throw new Error(`${kind} 输入特征不匹配: 需要 ${inputSize}, 实际 ${String(featureDim)}`)
  }

  if (returnSequences) {
    return {
      dtype: input.dtype,
      shape: batchFirst
        ? [batchDim, sequenceDim, hiddenSize * directionMultiplier]
        : [sequenceDim, batchDim, hiddenSize * directionMultiplier],
    }
  }

  return {
    dtype: input.dtype,
    shape: [batchDim, hiddenSize * directionMultiplier],
  }
}

function inferTransformerEncoder(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 3) {
    throw new Error("TransformerEncoder 需要 3D token 序列。")
  }

  const dModel = asNumber(node.params.d_model, 512)

  if (input.shape[2] !== dModel) {
    throw new Error(`TransformerEncoder d_model 不匹配: 需要 ${dModel}, 实际 ${String(input.shape[2])}`)
  }

  return input
}

function inferTransformerDecoder(node: LayerNode, tgt: TensorSpec, memory: TensorSpec): TensorSpec {
  if (tgt.shape.length !== 3 || memory.shape.length !== 3) {
    throw new Error("TransformerDecoder 需要 3D target 与 memory。")
  }

  const dModel = asNumber(node.params.d_model, 512)

  if (tgt.shape[2] !== dModel || memory.shape[2] !== dModel) {
    throw new Error(`TransformerDecoder d_model 不匹配: 需要 ${dModel}。`)
  }

  if (tgt.shape[0] !== memory.shape[0]) {
    throw new Error("TransformerDecoder target 与 memory 的 batch 必须一致。")
  }

  return {
    dtype: tgt.dtype,
    shape: [...tgt.shape],
  }
}

function inferAdd(inputs: Array<TensorSpec | null | undefined>): TensorSpec {
  const definedInputs = inputs.filter((input): input is TensorSpec => Boolean(input))

  if (definedInputs.length < 2) {
    throw new Error("Add 需要两个输入。")
  }

  const [first, ...rest] = definedInputs

  for (const input of rest) {
    if (!shapesEqual(first.shape, input.shape)) {
      throw new Error("Add 两边 shape 不一致。")
    }
  }

  return first
}

function inferConcat(node: LayerNode, inputs: Array<TensorSpec | null | undefined>): TensorSpec {
  const definedInputs = inputs.filter((input): input is TensorSpec => Boolean(input))

  if (definedInputs.length < 2) {
    throw new Error("Concat 需要两个输入。")
  }

  const dim = asNumber(node.params.dim, 1)
  const baseShape = [...definedInputs[0].shape]

  if (dim < 0 || dim >= baseShape.length) {
    throw new Error("Concat 维度超出范围。")
  }

  let dimTotal = 0

  for (const input of definedInputs) {
    if (input.shape.length !== baseShape.length) {
      throw new Error("Concat 输入 rank 不一致。")
    }

    for (let index = 0; index < baseShape.length; index += 1) {
      if (index === dim) {
        continue
      }

      if (baseShape[index] !== input.shape[index]) {
        throw new Error("Concat 除拼接维度外 shape 必须一致。")
      }
    }

    const currentDim = input.shape[dim]

    if (typeof currentDim !== "number") {
      dimTotal = -1
    } else if (dimTotal !== -1) {
      dimTotal += currentDim
    }
  }

  baseShape[dim] = dimTotal === -1 ? null : dimTotal

  return {
    dtype: definedInputs[0].dtype,
    shape: baseShape,
  }
}

function inferOutput(input: TensorSpec): TensorSpec {
  return input
}

function inferNode(node: LayerNode, inputSpecs: Array<TensorSpec | null>): TensorSpec[] {
  switch (node.layerType) {
    case "Input":
      return [inferInput(node)]
    case "Embedding":
      return [inferEmbedding(node, expectInput(inputSpecs[0], node.name))]
    case "Conv2d":
      return [inferConv2d(node, expectInput(inputSpecs[0], node.name))]
    case "ResidualBlock2d":
      return [inferResidualBlock2d(node, expectInput(inputSpecs[0], node.name))]
    case "BatchNorm2d":
      return [inferBatchNorm2d(node, expectInput(inputSpecs[0], node.name))]
    case "LayerNorm":
      return [inferLayerNorm(node, expectInput(inputSpecs[0], node.name))]
    case "ReLU":
    case "GELU":
      return [inferIdentity(expectInput(inputSpecs[0], node.name))]
    case "MaxPool2d":
      return [inferMaxPool2d(node, expectInput(inputSpecs[0], node.name))]
    case "AdaptiveAvgPool2d":
      return [inferAdaptiveAvgPool2d(node, expectInput(inputSpecs[0], node.name))]
    case "PatchEmbedding":
      return [inferPatchEmbedding(node, expectInput(inputSpecs[0], node.name))]
    case "TokenPool":
      return [inferTokenPool(node, expectInput(inputSpecs[0], node.name))]
    case "Flatten":
      return [inferFlatten(node, expectInput(inputSpecs[0], node.name))]
    case "Linear":
      return [inferLinear(node, expectInput(inputSpecs[0], node.name))]
    case "Dropout":
      return [inferDropout(expectInput(inputSpecs[0], node.name))]
    case "LSTM":
      return [inferRecurrent(node, expectInput(inputSpecs[0], node.name), "LSTM")]
    case "GRU":
      return [inferRecurrent(node, expectInput(inputSpecs[0], node.name), "GRU")]
    case "TransformerEncoder":
      return [inferTransformerEncoder(node, expectInput(inputSpecs[0], node.name))]
    case "TransformerDecoder":
      return [
        inferTransformerDecoder(
          node,
          expectInput(inputSpecs[0], node.name, "tgt"),
          expectInput(inputSpecs[1], node.name, "memory"),
        ),
      ]
    case "Add":
      return [inferAdd(inputSpecs)]
    case "Concat":
      return [inferConcat(node, inputSpecs)]
    case "Output":
      return [inferOutput(expectInput(inputSpecs[0], node.name))]
  }
}

function orderInputsForNode(graph: NeuralGraph, node: LayerNode, specsByNodeId: InferenceResult["specsByNodeId"]): Array<TensorSpec | null> {
  const layerDef = getLayerDef(node.layerType)
  const incomingEdges = getIncomingEdges(graph, node.id)

  if (layerDef.inputs.length <= 1) {
    const edge = incomingEdges[0]
    return [edge ? specsByNodeId[edge.fromNodeId]?.outputs[0] ?? null : null]
  }

  return layerDef.inputs.map((portDef) => {
    const edge = incomingEdges.find((candidate) => candidate.toPort === portDef.name)
    return edge ? specsByNodeId[edge.fromNodeId]?.outputs[0] ?? null : null
  })
}

export function inferGraph(graph: NeuralGraph): InferenceResult {
  const { orderedNodeIds, hasCycle } = topologicalSort(graph)
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]))
  const issues: GraphIssue[] = []

  if (hasCycle) {
    issues.push({
      level: "error",
      message: "Graph 存在环，无法完成 shape 推导。",
    })
  }

  const specsByNodeId: InferenceResult["specsByNodeId"] = {}

  for (const nodeId of orderedNodeIds) {
    const node = nodeMap.get(nodeId)

    if (!node) {
      continue
    }

    const inputSpecs = orderInputsForNode(graph, node, specsByNodeId)

    try {
      const outputs = inferNode(node, inputSpecs)

      specsByNodeId[nodeId] = {
        inputs: inputSpecs,
        outputs,
      }
    } catch (error) {
      issues.push({
        level: "error",
        nodeId,
        message: error instanceof Error ? error.message : "Shape 推导失败。",
      })

      specsByNodeId[nodeId] = {
        inputs: inputSpecs,
        outputs: [],
      }
    }
  }

  return {
    orderedNodeIds,
    specsByNodeId,
    issues,
  }
}
