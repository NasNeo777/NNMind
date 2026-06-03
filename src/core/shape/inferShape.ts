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
import { coerceDtype } from "../registry/layerRegistry"

function expectInput(input: TensorSpec | undefined, layerName: string): TensorSpec {
  if (!input) {
    throw new Error(`${layerName} 缺少输入张量。`)
  }

  return input
}

function asTuple(value: unknown, fallback: [number, number]): [number, number] {
  if (Array.isArray(value) && value.length >= 2) {
    return [Number(value[0]) || fallback[0], Number(value[1]) || fallback[1]]
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

function inferConv2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("Conv2d 需要 4D Tensor: [B, C, H, W]")
  }

  const [batch, channels, height, width] = input.shape
  const [kernelH, kernelW] = asTuple(node.params.kernel_size, [3, 3])
  const [strideH, strideW] = asTuple(node.params.stride, [1, 1])
  const [paddingH, paddingW] = asTuple(node.params.padding, [1, 1])
  const [dilationH, dilationW] = asTuple(node.params.dilation, [1, 1])
  const inChannels = Number(node.params.in_channels)
  const outChannels = Number(node.params.out_channels)

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

function inferBatchNorm2d(node: LayerNode, input: TensorSpec): TensorSpec {
  if (input.shape.length !== 4) {
    throw new Error("BatchNorm2d 需要 4D Tensor。")
  }

  const features = Number(node.params.num_features)

  if (input.shape[1] !== features) {
    throw new Error(`BatchNorm2d 特征数不匹配: 需要 ${features}, 实际 ${String(input.shape[1])}`)
  }

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

function inferFlatten(node: LayerNode, input: TensorSpec): TensorSpec {
  const startDim = Number(node.params.start_dim ?? 1)
  const endDimRaw = Number(node.params.end_dim ?? -1)
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
  if (input.shape.length !== 2) {
    throw new Error("Linear 需要 2D Tensor: [B, features]")
  }

  const [batch, features] = input.shape
  const inFeatures = Number(node.params.in_features)
  const outFeatures = Number(node.params.out_features)

  if (features !== inFeatures) {
    throw new Error(`Linear 输入特征不匹配: 需要 ${inFeatures}, 实际 ${String(features)}`)
  }

  return {
    dtype: input.dtype,
    shape: [batch, outFeatures],
  }
}

function inferDropout(input: TensorSpec): TensorSpec {
  return input
}

function inferAdd(inputs: TensorSpec[]): TensorSpec {
  if (inputs.length < 2) {
    throw new Error("Add 需要两个输入。")
  }

  const [first, ...rest] = inputs

  for (const input of rest) {
    if (!shapesEqual(first.shape, input.shape)) {
      throw new Error("Add 两边 shape 不一致。")
    }
  }

  return first
}

function inferConcat(node: LayerNode, inputs: TensorSpec[]): TensorSpec {
  if (inputs.length < 2) {
    throw new Error("Concat 需要两个输入。")
  }

  const dim = Number(node.params.dim ?? 1)
  const baseShape = [...inputs[0].shape]

  if (dim < 0 || dim >= baseShape.length) {
    throw new Error("Concat 维度超出范围。")
  }

  let dimTotal = 0

  for (const input of inputs) {
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
    dtype: inputs[0].dtype,
    shape: baseShape,
  }
}

function inferOutput(input: TensorSpec): TensorSpec {
  return input
}

function inferNode(node: LayerNode, inputSpecs: TensorSpec[]): TensorSpec[] {
  switch (node.layerType) {
    case "Input":
      return [inferInput(node)]
    case "Conv2d":
      return [inferConv2d(node, expectInput(inputSpecs[0], node.name))]
    case "BatchNorm2d":
      return [inferBatchNorm2d(node, expectInput(inputSpecs[0], node.name))]
    case "ReLU":
      return [inferIdentity(expectInput(inputSpecs[0], node.name))]
    case "MaxPool2d":
      return [inferMaxPool2d(node, expectInput(inputSpecs[0], node.name))]
    case "AdaptiveAvgPool2d":
      return [inferAdaptiveAvgPool2d(node, expectInput(inputSpecs[0], node.name))]
    case "Flatten":
      return [inferFlatten(node, expectInput(inputSpecs[0], node.name))]
    case "Linear":
      return [inferLinear(node, expectInput(inputSpecs[0], node.name))]
    case "Dropout":
      return [inferDropout(expectInput(inputSpecs[0], node.name))]
    case "Add":
      return [inferAdd(inputSpecs)]
    case "Concat":
      return [inferConcat(node, inputSpecs)]
    case "Output":
      return [inferOutput(expectInput(inputSpecs[0], node.name))]
  }
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

    const incomingEdges = getIncomingEdges(graph, nodeId)
    const inputSpecs = incomingEdges
      .map((edge) => specsByNodeId[edge.fromNodeId]?.outputs[0])
      .filter((spec): spec is TensorSpec => Boolean(spec))

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
