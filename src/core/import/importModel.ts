import type { GraphLayoutMode, GraphEdge, LayerNode, LayerType, NeuralGraph, ParamValue } from "../graph/types"
import { createDefaultParams } from "../registry/layerRegistry"

type ParsedModule = {
  layerType: LayerType
  name: string
  params: Record<string, ParamValue>
}

type ParsedOperation =
  | {
      kind: "module"
      output: string
      moduleName: string
      inputs: string[]
    }
  | {
      kind: "add"
      output: string
      inputs: string[]
    }
  | {
      kind: "concat"
      output: string
      inputs: string[]
      dim: number
    }
  | {
      kind: "alias"
      output: string
      input: string
    }

function parseArgsObject(args: string): string[] {
  const result: string[] = []
  let current = ""
  let depth = 0

  for (const char of args) {
    if (char === "(" || char === "[" || char === "{") {
      depth += 1
    } else if (char === ")" || char === "]" || char === "}") {
      depth -= 1
    }

    if (char === "," && depth === 0) {
      result.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  if (current.trim()) {
    result.push(current.trim())
  }

  return result
}

function parseValue(raw: string): ParamValue {
  const value = raw.trim()

  if (value === "True") return true
  if (value === "False") return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if ((value.startsWith("(") && value.endsWith(")")) || (value.startsWith("[") && value.endsWith("]"))) {
    return parseArgsObject(value.slice(1, -1)).map((item) => parseValue(item) as string | number | null)
  }

  return value.replace(/^["']|["']$/g, "")
}

function parseNamedAndPositionalArgs(args: string) {
  const parts = parseArgsObject(args)
  const positional: ParamValue[] = []
  const named = new Map<string, ParamValue>()

  for (const part of parts) {
    const eqIndex = part.indexOf("=")
    if (eqIndex === -1) {
      positional.push(parseValue(part))
    } else {
      const key = part.slice(0, eqIndex).trim()
      const value = part.slice(eqIndex + 1).trim()
      named.set(key, parseValue(value))
    }
  }

  return { positional, named }
}

function parseModuleDefinition(moduleName: string, className: string, args: string): ParsedModule | null {
  const parsed = parseNamedAndPositionalArgs(args)

  switch (className) {
    case "Embedding": {
      const params = createDefaultParams("Embedding")
      params.num_embeddings = parsed.positional[0] ?? params.num_embeddings
      params.embedding_dim = parsed.positional[1] ?? params.embedding_dim
      return { layerType: "Embedding", name: moduleName, params }
    }
    case "Conv2d": {
      const params = createDefaultParams("Conv2d")
      params.in_channels = parsed.positional[0] ?? params.in_channels
      params.out_channels = parsed.positional[1] ?? params.out_channels
      params.kernel_size = parsed.positional[2] ?? params.kernel_size
      params.stride = parsed.positional[3] ?? parsed.named.get("stride") ?? params.stride
      params.padding = parsed.positional[4] ?? parsed.named.get("padding") ?? params.padding
      params.dilation = parsed.named.get("dilation") ?? params.dilation
      params.bias = parsed.named.get("bias") ?? params.bias
      return { layerType: "Conv2d", name: moduleName, params }
    }
    case "BatchNorm2d": {
      const params = createDefaultParams("BatchNorm2d")
      params.num_features = parsed.positional[0] ?? params.num_features
      return { layerType: "BatchNorm2d", name: moduleName, params }
    }
    case "LayerNorm": {
      const params = createDefaultParams("LayerNorm")
      params.normalized_shape = parsed.positional[0] ?? params.normalized_shape
      return { layerType: "LayerNorm", name: moduleName, params }
    }
    case "ReLU": {
      const params = createDefaultParams("ReLU")
      params.inplace = parsed.named.get("inplace") ?? params.inplace
      return { layerType: "ReLU", name: moduleName, params }
    }
    case "GELU":
      return { layerType: "GELU", name: moduleName, params: createDefaultParams("GELU") }
    case "MaxPool2d": {
      const params = createDefaultParams("MaxPool2d")
      params.kernel_size = parsed.positional[0] ?? params.kernel_size
      params.stride = parsed.positional[1] ?? parsed.named.get("stride") ?? params.stride
      params.padding = parsed.positional[2] ?? parsed.named.get("padding") ?? params.padding
      return { layerType: "MaxPool2d", name: moduleName, params }
    }
    case "AdaptiveAvgPool2d": {
      const params = createDefaultParams("AdaptiveAvgPool2d")
      params.output_size = parsed.positional[0] ?? params.output_size
      return { layerType: "AdaptiveAvgPool2d", name: moduleName, params }
    }
    case "Flatten": {
      const params = createDefaultParams("Flatten")
      params.start_dim = parsed.named.get("start_dim") ?? parsed.positional[0] ?? params.start_dim
      params.end_dim = parsed.named.get("end_dim") ?? parsed.positional[1] ?? params.end_dim
      return { layerType: "Flatten", name: moduleName, params }
    }
    case "Linear": {
      const params = createDefaultParams("Linear")
      params.in_features = parsed.positional[0] ?? params.in_features
      params.out_features = parsed.positional[1] ?? params.out_features
      params.bias = parsed.named.get("bias") ?? params.bias
      return { layerType: "Linear", name: moduleName, params }
    }
    case "Dropout": {
      const params = createDefaultParams("Dropout")
      params.p = parsed.named.get("p") ?? parsed.positional[0] ?? params.p
      return { layerType: "Dropout", name: moduleName, params }
    }
    case "LSTM": {
      const params = createDefaultParams("LSTM")
      params.input_size = parsed.named.get("input_size") ?? parsed.positional[0] ?? params.input_size
      params.hidden_size = parsed.named.get("hidden_size") ?? parsed.positional[1] ?? params.hidden_size
      params.num_layers = parsed.named.get("num_layers") ?? params.num_layers
      params.dropout = parsed.named.get("dropout") ?? params.dropout
      params.bidirectional = parsed.named.get("bidirectional") ?? params.bidirectional
      params.batch_first = parsed.named.get("batch_first") ?? params.batch_first
      return { layerType: "LSTM", name: moduleName, params }
    }
    case "GRU": {
      const params = createDefaultParams("GRU")
      params.input_size = parsed.named.get("input_size") ?? parsed.positional[0] ?? params.input_size
      params.hidden_size = parsed.named.get("hidden_size") ?? parsed.positional[1] ?? params.hidden_size
      params.num_layers = parsed.named.get("num_layers") ?? params.num_layers
      params.dropout = parsed.named.get("dropout") ?? params.dropout
      params.bidirectional = parsed.named.get("bidirectional") ?? params.bidirectional
      params.batch_first = parsed.named.get("batch_first") ?? params.batch_first
      return { layerType: "GRU", name: moduleName, params }
    }
    case "TransformerEncoder": {
      const params = createDefaultParams("TransformerEncoder")
      const layerMatch = args.match(/d_model\s*=\s*(\d+).*?nhead\s*=\s*(\d+).*?dim_feedforward\s*=\s*(\d+).*?dropout\s*=\s*([0-9.]+).*?activation\s*=\s*["'](\w+)["']/s)
      const layerCount = args.match(/num_layers\s*=\s*(\d+)/)
      if (layerMatch) {
        params.d_model = Number(layerMatch[1])
        params.nhead = Number(layerMatch[2])
        params.dim_feedforward = Number(layerMatch[3])
        params.dropout = Number(layerMatch[4])
        params.activation = layerMatch[5]
      }
      if (layerCount) {
        params.num_layers = Number(layerCount[1])
      }
      return { layerType: "TransformerEncoder", name: moduleName, params }
    }
    case "TransformerDecoder": {
      const params = createDefaultParams("TransformerDecoder")
      const layerMatch = args.match(/d_model\s*=\s*(\d+).*?nhead\s*=\s*(\d+).*?dim_feedforward\s*=\s*(\d+).*?dropout\s*=\s*([0-9.]+).*?activation\s*=\s*["'](\w+)["']/s)
      const layerCount = args.match(/num_layers\s*=\s*(\d+)/)
      if (layerMatch) {
        params.d_model = Number(layerMatch[1])
        params.nhead = Number(layerMatch[2])
        params.dim_feedforward = Number(layerMatch[3])
        params.dropout = Number(layerMatch[4])
        params.activation = layerMatch[5]
      }
      if (layerCount) {
        params.num_layers = Number(layerCount[1])
      }
      return { layerType: "TransformerDecoder", name: moduleName, params }
    }
    case "PatchEmbedding2D":
    case "PatchEmbedding": {
      const params = createDefaultParams("PatchEmbedding")
      params.in_channels = parsed.positional[0] ?? params.in_channels
      params.embed_dim = parsed.positional[1] ?? params.embed_dim
      params.patch_size = parsed.positional[2] ?? params.patch_size
      return { layerType: "PatchEmbedding", name: moduleName, params }
    }
    case "ResidualBlock2D":
    case "ResidualBlock2d": {
      const params = createDefaultParams("ResidualBlock2d")
      params.in_channels = parsed.positional[0] ?? params.in_channels
      params.out_channels = parsed.positional[1] ?? params.out_channels
      params.stride = parsed.named.get("stride") ?? parsed.positional[2] ?? params.stride
      params.use_projection = parsed.named.get("use_projection") ?? params.use_projection
      return { layerType: "ResidualBlock2d", name: moduleName, params }
    }
    default:
      return null
  }
}

function parseModules(source: string): Map<string, ParsedModule> {
  const modules = new Map<string, ParsedModule>()
  const regex = /self\.(\w+)\s*=\s*(?:nn\.)?(\w+)\(([\s\S]*?)\)\s*$/gm

  let match: RegExpExecArray | null
  while ((match = regex.exec(source)) !== null) {
    const [, moduleName, className, args] = match
    const parsed = parseModuleDefinition(moduleName, className, args)
    if (parsed) {
      modules.set(moduleName, parsed)
    }
  }

  return modules
}

function parseForwardOperations(source: string): { args: string[]; operations: ParsedOperation[] } {
  const forwardMatch = source.match(/def\s+forward\s*\(\s*self\s*,([\s\S]*?)\)\s*:\s*([\s\S]*?)(?:\n\s*def\s+\w+\s*\(|$)/)
  if (!forwardMatch) {
    throw new Error("Could not find forward() in the model file.")
  }

  const argString = forwardMatch[1]
  const body = forwardMatch[2]
  const args = parseArgsObject(argString)
    .map((part) => part.split("=")[0].trim())
    .filter(Boolean)
  const operations: ParsedOperation[] = []

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const moduleMatch = line.match(/^(\w+)(?:\s*,\s*_)?\s*=\s*self\.(\w+)\((.*)\)$/)
    if (moduleMatch) {
      operations.push({
        kind: "module",
        output: moduleMatch[1],
        moduleName: moduleMatch[2],
        inputs: parseArgsObject(moduleMatch[3]).map((item) => item.trim()).filter(Boolean),
      })
      continue
    }

    const concatMatch = line.match(/^(\w+)\s*=\s*torch\.cat\(\[(.+)\],\s*dim\s*=\s*(\d+)\)$/)
    if (concatMatch) {
      operations.push({
        kind: "concat",
        output: concatMatch[1],
        inputs: concatMatch[2].split(",").map((item) => item.trim()).filter(Boolean),
        dim: Number(concatMatch[3]),
      })
      continue
    }

    const addMatch = line.match(/^(\w+)\s*=\s*(\w+)\s*\+\s*(\w+)$/)
    if (addMatch) {
      operations.push({
        kind: "add",
        output: addMatch[1],
        inputs: [addMatch[2], addMatch[3]],
      })
      continue
    }

    const aliasMatch = line.match(/^(\w+)\s*=\s*(\w+)$/)
    if (aliasMatch && aliasMatch[1] !== aliasMatch[2]) {
      operations.push({
        kind: "alias",
        output: aliasMatch[1],
        input: aliasMatch[2],
      })
    }
  }

  return { args, operations }
}

function orientPosition(index: number, layoutMode: GraphLayoutMode) {
  return layoutMode === "vertical"
    ? { x: 220 + (index % 2) * 260, y: 120 + index * 170 }
    : { x: 120 + index * 240, y: 160 + (index % 2) * 120 }
}

export function importModelSource(raw: string, layoutMode: GraphLayoutMode): NeuralGraph {
  const trimmed = raw.trim()

  try {
    const parsed = JSON.parse(trimmed) as NeuralGraph
    if (parsed?.framework === "pytorch" && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
      return parsed
    }
  } catch {
    // continue with .py parser
  }

  const modules = parseModules(raw)
  const { args, operations } = parseForwardOperations(raw)
  const nodes: LayerNode[] = []
  const edges: GraphEdge[] = []
  const variableToNodeId = new Map<string, string>()
  const createdNodeIds = new Set<string>()

  args.forEach((argName, index) => {
    const inputNodeId = `input_${argName}`
    const defaultShape =
      argName.includes("token") || argName.includes("ids")
        ? ["B", 128]
        : argName.includes("src") || argName.includes("tgt")
          ? ["B", 128]
          : ["B", 3, 224, 224]

    nodes.push({
      id: inputNodeId,
      name: argName,
      layerType: "Input",
      position: orientPosition(index, layoutMode),
      params: {
        ...createDefaultParams("Input"),
        shape: defaultShape,
        dtype: argName.includes("token") || argName.includes("ids") ? "int64" : "float32",
      },
    })
    variableToNodeId.set(argName, inputNodeId)
    createdNodeIds.add(inputNodeId)
  })

  let operationIndex = args.length

  for (const operation of operations) {
    if (operation.kind === "alias") {
      const aliasedNodeId = variableToNodeId.get(operation.input)
      if (aliasedNodeId) {
        variableToNodeId.set(operation.output, aliasedNodeId)
      }
      continue
    }

    let layerType: LayerType
    let nodeName = operation.output
    let params: Record<string, ParamValue> = {}
    let nodeId = `node_${operation.output}_${operationIndex}`

    if (operation.kind === "module") {
      const module = modules.get(operation.moduleName)
      if (!module) continue
      layerType = module.layerType
      nodeName = module.name
      params = module.params
      nodeId = `module_${module.name}`

      if (!createdNodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          name: nodeName,
          layerType,
          position: orientPosition(operationIndex, layoutMode),
          params,
        })
        createdNodeIds.add(nodeId)
      }
    } else if (operation.kind === "add") {
      layerType = "Add"
      params = createDefaultParams("Add")
      nodes.push({
        id: nodeId,
        name: nodeName,
        layerType,
        position: orientPosition(operationIndex, layoutMode),
        params,
      })
      createdNodeIds.add(nodeId)
    } else {
      layerType = "Concat"
      params = {
        ...createDefaultParams("Concat"),
        dim: operation.dim,
      }
      nodes.push({
        id: nodeId,
        name: nodeName,
        layerType,
        position: orientPosition(operationIndex, layoutMode),
        params,
      })
      createdNodeIds.add(nodeId)
    }

    const targetId = operation.kind === "module" ? `module_${nodeName}` : nodeId
    operation.inputs.forEach((inputVar, inputIndex) => {
      const sourceNodeId = variableToNodeId.get(inputVar)
      if (!sourceNodeId) return
      const targetPort =
        operation.kind === "module" && layerType === "TransformerDecoder"
          ? inputIndex === 0
            ? "tgt"
            : "memory"
          : operation.kind !== "module" && inputIndex === 0
            ? "a"
            : operation.kind !== "module" && inputIndex === 1
              ? "b"
              : "in"

      edges.push({
        id: `e-${sourceNodeId}-${targetId}-${targetPort}`,
        fromNodeId: sourceNodeId,
        fromPort: "out",
        toNodeId: targetId,
        toPort: targetPort,
      })
    })

    variableToNodeId.set(operation.output, targetId)
    operationIndex += 1
  }

  const lastVariable = [...variableToNodeId.entries()]
    .filter(([variable]) => !args.includes(variable))
    .pop()

  if (!lastVariable) {
    throw new Error("Could not reconstruct graph from the model file.")
  }

  const outputId = "output"
  nodes.push({
    id: outputId,
    name: "output",
    layerType: "Output",
    position: orientPosition(operationIndex + 1, layoutMode),
    params: createDefaultParams("Output"),
  })
  edges.push({
    id: `e-${lastVariable[1]}-${outputId}-in`,
    fromNodeId: lastVariable[1],
    fromPort: "out",
    toNodeId: outputId,
    toPort: "in",
  })

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges,
  }
}
