import { getIncomingEdges, topologicalSort } from "../graph/utils"
import type { LayerNode, NeuralGraph, ParamValue, TensorShape } from "../graph/types"
import { getLayerDef } from "../registry/layerRegistry"

function pyBool(value: ParamValue): string {
  return value ? "True" : "False"
}

function tupleToPython(value: ParamValue): string {
  if (!Array.isArray(value)) {
    return String(value)
  }

  const numeric = value.map((item) => String(item))
  return `(${numeric.join(", ")}${numeric.length === 1 ? "," : ""})`
}

function sanitizePythonName(raw: string, fallback: string): string {
  const normalized = raw
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")

  if (!normalized) {
    return fallback
  }

  return /^[0-9]/.test(normalized) ? `${fallback}_${normalized}` : normalized
}

function buildUniqueName(raw: string, fallback: string, used: Set<string>): string {
  const base = sanitizePythonName(raw, fallback)

  if (!used.has(base)) {
    used.add(base)
    return base
  }

  let index = 2

  while (used.has(`${base}_${index}`)) {
    index += 1
  }

  const unique = `${base}_${index}`
  used.add(unique)
  return unique
}

function exampleTensor(shape: TensorShape, dtype: ParamValue): string {
  const dims = shape.map((dim) => (typeof dim === "number" ? dim : 2))
  const tuple = `(${dims.join(", ")}${dims.length === 1 ? "," : ""})`

  if (dtype === "int64") {
    return `torch.zeros(${tuple}, dtype=torch.long)`
  }

  return `torch.randn(${tuple})`
}

function needsModule(node: LayerNode): boolean {
  return !["Input", "Output", "Add", "Concat", "TokenPool"].includes(node.layerType)
}

function helperCode(helpers: Set<string>): string[] {
  const blocks: string[] = []

  if (helpers.has("ResidualBlock2D")) {
    blocks.push(
      [
        "class ResidualBlock2D(nn.Module):",
        "    def __init__(self, in_channels, out_channels, stride=1, use_projection=False):",
        "        super().__init__()",
        "        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)",
        "        self.bn1 = nn.BatchNorm2d(out_channels)",
        "        self.relu = nn.ReLU(inplace=True)",
        "        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)",
        "        self.bn2 = nn.BatchNorm2d(out_channels)",
        "        self.use_projection = use_projection or stride != 1 or in_channels != out_channels",
        "        self.proj = nn.Identity() if not self.use_projection else nn.Sequential(",
        "            nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),",
        "            nn.BatchNorm2d(out_channels),",
        "        )",
        "",
        "    def forward(self, x):",
        "        identity = self.proj(x)",
        "        out = self.conv1(x)",
        "        out = self.bn1(out)",
        "        out = self.relu(out)",
        "        out = self.conv2(out)",
        "        out = self.bn2(out)",
        "        out = out + identity",
        "        out = self.relu(out)",
        "        return out",
      ].join("\n"),
    )
  }

  if (helpers.has("ResNetBasicBlock")) {
    blocks.push(
      [
        "class ResNetBasicBlock(nn.Module):",
        "    def __init__(self, in_channels, out_channels, stride=1, use_projection=False):",
        "        super().__init__()",
        "        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)",
        "        self.bn1 = nn.BatchNorm2d(out_channels)",
        "        self.relu = nn.ReLU(inplace=True)",
        "        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)",
        "        self.bn2 = nn.BatchNorm2d(out_channels)",
        "        self.use_projection = use_projection or stride != 1 or in_channels != out_channels",
        "        self.proj = nn.Identity() if not self.use_projection else nn.Sequential(",
        "            nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),",
        "            nn.BatchNorm2d(out_channels),",
        "        )",
        "",
        "    def forward(self, x):",
        "        identity = self.proj(x)",
        "        out = self.conv1(x)",
        "        out = self.bn1(out)",
        "        out = self.relu(out)",
        "        out = self.conv2(out)",
        "        out = self.bn2(out)",
        "        out = out + identity",
        "        out = self.relu(out)",
        "        return out",
      ].join("\n"),
    )
  }

  if (helpers.has("ResNetBottleneck")) {
    blocks.push(
      [
        "class ResNetBottleneck(nn.Module):",
        "    def __init__(self, in_channels, bottleneck_channels, out_channels, stride=1, use_projection=False):",
        "        super().__init__()",
        "        self.conv1 = nn.Conv2d(in_channels, bottleneck_channels, kernel_size=1, bias=False)",
        "        self.bn1 = nn.BatchNorm2d(bottleneck_channels)",
        "        self.conv2 = nn.Conv2d(bottleneck_channels, bottleneck_channels, kernel_size=3, stride=stride, padding=1, bias=False)",
        "        self.bn2 = nn.BatchNorm2d(bottleneck_channels)",
        "        self.conv3 = nn.Conv2d(bottleneck_channels, out_channels, kernel_size=1, bias=False)",
        "        self.bn3 = nn.BatchNorm2d(out_channels)",
        "        self.relu = nn.ReLU(inplace=True)",
        "        self.use_projection = use_projection or stride != 1 or in_channels != out_channels",
        "        self.proj = nn.Identity() if not self.use_projection else nn.Sequential(",
        "            nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),",
        "            nn.BatchNorm2d(out_channels),",
        "        )",
        "",
        "    def forward(self, x):",
        "        identity = self.proj(x)",
        "        out = self.conv1(x)",
        "        out = self.bn1(out)",
        "        out = self.relu(out)",
        "        out = self.conv2(out)",
        "        out = self.bn2(out)",
        "        out = self.relu(out)",
        "        out = self.conv3(out)",
        "        out = self.bn3(out)",
        "        out = out + identity",
        "        out = self.relu(out)",
        "        return out",
      ].join("\n"),
    )
  }

  if (helpers.has("PatchEmbedding2D")) {
    blocks.push(
      [
        "class PatchEmbedding2D(nn.Module):",
        "    def __init__(self, in_channels, embed_dim, patch_size):",
        "        super().__init__()",
        "        self.proj = nn.Conv2d(in_channels, embed_dim, kernel_size=patch_size, stride=patch_size)",
        "",
        "    def forward(self, x):",
        "        x = self.proj(x)",
        "        x = x.flatten(2).transpose(1, 2)",
        "        return x",
      ].join("\n"),
    )
  }

  return blocks
}

function moduleLine(node: LayerNode, moduleName: string, helpers: Set<string>): string | null {
  switch (node.layerType) {
    case "Embedding":
      return `self.${moduleName} = nn.Embedding(${node.params.num_embeddings}, ${node.params.embedding_dim})`
    case "Conv2d":
      return `self.${moduleName} = nn.Conv2d(${node.params.in_channels}, ${node.params.out_channels}, ${tupleToPython(node.params.kernel_size)}, ${tupleToPython(node.params.stride)}, ${tupleToPython(node.params.padding)}, dilation=${tupleToPython(node.params.dilation)}, bias=${pyBool(node.params.bias)})`
    case "ResidualBlock2d":
      helpers.add("ResidualBlock2D")
      return `self.${moduleName} = ResidualBlock2D(${node.params.in_channels}, ${node.params.out_channels}, stride=${node.params.stride}, use_projection=${pyBool(node.params.use_projection)})`
    case "ResNetBasicBlock":
      helpers.add("ResNetBasicBlock")
      return `self.${moduleName} = ResNetBasicBlock(${node.params.in_channels}, ${node.params.out_channels}, stride=${node.params.stride}, use_projection=${pyBool(node.params.use_projection)})`
    case "ResNetBottleneck":
      helpers.add("ResNetBottleneck")
      return `self.${moduleName} = ResNetBottleneck(${node.params.in_channels}, ${node.params.bottleneck_channels}, ${node.params.out_channels}, stride=${node.params.stride}, use_projection=${pyBool(node.params.use_projection)})`
    case "BatchNorm2d":
      return `self.${moduleName} = nn.BatchNorm2d(${node.params.num_features})`
    case "LayerNorm":
      return `self.${moduleName} = nn.LayerNorm(${tupleToPython(node.params.normalized_shape)})`
    case "ReLU":
      return `self.${moduleName} = nn.ReLU(inplace=${pyBool(node.params.inplace)})`
    case "GELU":
      return `self.${moduleName} = nn.GELU()`
    case "MaxPool2d":
      return `self.${moduleName} = nn.MaxPool2d(${tupleToPython(node.params.kernel_size)}, ${tupleToPython(node.params.stride)}, ${tupleToPython(node.params.padding)})`
    case "AdaptiveAvgPool2d":
      return `self.${moduleName} = nn.AdaptiveAvgPool2d(${tupleToPython(node.params.output_size)})`
    case "PatchEmbedding":
      helpers.add("PatchEmbedding2D")
      return `self.${moduleName} = PatchEmbedding2D(${node.params.in_channels}, ${node.params.embed_dim}, ${tupleToPython(node.params.patch_size)})`
    case "Flatten":
      return `self.${moduleName} = nn.Flatten(start_dim=${node.params.start_dim}, end_dim=${node.params.end_dim})`
    case "Linear":
      return `self.${moduleName} = nn.Linear(${node.params.in_features}, ${node.params.out_features}, bias=${pyBool(node.params.bias)})`
    case "Dropout":
      return `self.${moduleName} = nn.Dropout(p=${node.params.p})`
    case "LSTM":
      return `self.${moduleName} = nn.LSTM(input_size=${node.params.input_size}, hidden_size=${node.params.hidden_size}, num_layers=${node.params.num_layers}, dropout=${node.params.dropout}, batch_first=${pyBool(node.params.batch_first)}, bidirectional=${pyBool(node.params.bidirectional)})`
    case "GRU":
      return `self.${moduleName} = nn.GRU(input_size=${node.params.input_size}, hidden_size=${node.params.hidden_size}, num_layers=${node.params.num_layers}, dropout=${node.params.dropout}, batch_first=${pyBool(node.params.batch_first)}, bidirectional=${pyBool(node.params.bidirectional)})`
    case "SelfAttention":
      return `self.${moduleName} = nn.MultiheadAttention(embed_dim=${node.params.embed_dim}, num_heads=${node.params.num_heads}, batch_first=${pyBool(node.params.batch_first)})`
    case "TransformerEncoder":
      return `self.${moduleName} = nn.TransformerEncoder(nn.TransformerEncoderLayer(d_model=${node.params.d_model}, nhead=${node.params.nhead}, dim_feedforward=${node.params.dim_feedforward}, dropout=${node.params.dropout}, activation="${node.params.activation}", batch_first=True), num_layers=${node.params.num_layers})`
    case "TransformerDecoder":
      return `self.${moduleName} = nn.TransformerDecoder(nn.TransformerDecoderLayer(d_model=${node.params.d_model}, nhead=${node.params.nhead}, dim_feedforward=${node.params.dim_feedforward}, dropout=${node.params.dropout}, activation="${node.params.activation}", batch_first=True), num_layers=${node.params.num_layers})`
    default:
      return null
  }
}

function orderedInputEdges(graph: NeuralGraph, node: LayerNode) {
  const incomingEdges = getIncomingEdges(graph, node.id)
  const layerDef = getLayerDef(node.layerType)

  if (layerDef.inputs.length <= 1) {
    return incomingEdges.slice(0, 1)
  }

  return layerDef.inputs
    .map((portDef) => incomingEdges.find((edge) => edge.toPort === portDef.name))
    .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge))
}

function operationLine(node: LayerNode, moduleName: string, outputVar: string, inputVars: string[]): string | null {
  switch (node.layerType) {
    case "Add":
      return `${outputVar} = ${inputVars[0]} + ${inputVars[1]}`
    case "Concat":
      return `${outputVar} = torch.cat([${inputVars.join(", ")}], dim=${node.params.dim})`
    case "TokenPool":
      return node.params.mode === "cls" ? `${outputVar} = ${inputVars[0]}[:, 0]` : `${outputVar} = ${inputVars[0]}.mean(dim=1)`
    case "LSTM":
    case "GRU":
      return node.params.return_sequences ? `${outputVar}, _ = self.${moduleName}(${inputVars[0]})` : `${outputVar}, _ = self.${moduleName}(${inputVars[0]})\n        ${outputVar} = ${outputVar}[:, -1] if ${pyBool(node.params.batch_first)} else ${outputVar}[-1]`
    case "SelfAttention":
      return `${outputVar}, _ = self.${moduleName}(${inputVars[0]}, ${inputVars[0]}, ${inputVars[0]}, need_weights=False)`
    case "TransformerDecoder":
      return `${outputVar} = self.${moduleName}(${inputVars[0]}, ${inputVars[1]})`
    default:
      return needsModule(node) ? `${outputVar} = self.${moduleName}(${inputVars[0]})` : null
  }
}

export function generatePyTorch(graph: NeuralGraph): string {
  const { orderedNodeIds, hasCycle } = topologicalSort(graph)

  if (hasCycle) {
    return [
      "# Cannot export a cyclic graph.",
      "# Remove loops before generating PyTorch code.",
    ].join("\n")
  }

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]))
  const orderedNodes = orderedNodeIds.map((id) => nodeMap.get(id)).filter((node): node is LayerNode => Boolean(node))
  const inputNodes = orderedNodes.filter((node) => node.layerType === "Input")
  const outputNodes = orderedNodes.filter((node) => node.layerType === "Output")

  if (inputNodes.length === 0 || outputNodes.length === 0) {
    return [
      "# Graph must contain at least one Input and one Output node.",
    ].join("\n")
  }

  const usedNames = new Set<string>()
  const moduleNames = new Map<string, string>()
  const variableNames = new Map<string, string>()
  const moduleLines: string[] = []
  const forwardLines: string[] = []
  const helpers = new Set<string>()

  for (const node of orderedNodes) {
    if (needsModule(node)) {
      const moduleName = buildUniqueName(node.name, node.layerType.toLowerCase(), usedNames)
      moduleNames.set(node.id, moduleName)
      const line = moduleLine(node, moduleName, helpers)

      if (line) {
        moduleLines.push(line)
      }
    }
  }

  const inputArgNames = new Map<string, string>()

  for (const node of inputNodes) {
    const argName = buildUniqueName(node.name, "input", usedNames)
    inputArgNames.set(node.id, argName)
    variableNames.set(node.id, argName)
  }

  for (const node of orderedNodes) {
    if (node.layerType === "Input") {
      continue
    }

    const orderedEdges = orderedInputEdges(graph, node)
    const inputVars = orderedEdges.map((edge) => variableNames.get(edge.fromNodeId)).filter((value): value is string => Boolean(value))

    if (node.layerType === "Output") {
      const outputVar = inputVars[0]
      if (outputVar) {
        variableNames.set(node.id, outputVar)
      }
      continue
    }

    const moduleName = moduleNames.get(node.id) ?? buildUniqueName(node.name, "layer", usedNames)
    const outputVar = buildUniqueName(node.name, "node", usedNames)
    const line = operationLine(node, moduleName, outputVar, inputVars)

    if (!line) {
      continue
    }

    forwardLines.push(line)
    variableNames.set(node.id, outputVar)
  }

  const returnedVars = outputNodes.map((node) => variableNames.get(node.id)).filter((value): value is string => Boolean(value))
  const helperBlocks = helperCode(helpers)
  const exampleLines = inputNodes.map((node) => {
    const argName = inputArgNames.get(node.id) ?? "input_tensor"
    const shape = Array.isArray(node.params.shape) ? (node.params.shape as TensorShape) : [2, 3, 224, 224]
    return `    ${argName} = ${exampleTensor(shape, node.params.dtype)}`
  })
  const callArgs = inputNodes.map((node) => inputArgNames.get(node.id)).filter((value): value is string => Boolean(value))
  const forwardSignature = inputNodes.map((node) => inputArgNames.get(node.id) ?? "input_tensor").join(", ")

  return [
    "import torch",
    "import torch.nn as nn",
    "",
    ...helperBlocks.flatMap((block) => [block, ""]),
    "class GeneratedNet(nn.Module):",
    "    def __init__(self):",
    "        super().__init__()",
    ...moduleLines.map((line) => `        ${line}`),
    "",
    `    def forward(self, ${forwardSignature}):`,
    ...forwardLines.flatMap((line) => line.split("\n").map((part) => `        ${part}`)),
    returnedVars.length <= 1
      ? `        return ${returnedVars[0] ?? callArgs[0]}`
      : `        return (${returnedVars.join(", ")})`,
    "",
    "",
    "if __name__ == \"__main__\":",
    "    model = GeneratedNet()",
    ...exampleLines,
    `    y = model(${callArgs.join(", ")})`,
    "    if isinstance(y, tuple):",
    "        print([item.shape for item in y])",
    "    else:",
    "        print(y.shape)",
  ].join("\n")
}
