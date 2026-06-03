import { getOutgoingEdges } from "../graph/utils"
import type { LayerNode, NeuralGraph, ParamValue } from "../graph/types"

function tupleToPython(value: ParamValue): string {
  if (!Array.isArray(value)) {
    return String(value)
  }

  const numeric = value.map((item) => String(item))
  return `(${numeric.join(", ")}${numeric.length === 1 ? "," : ""})`
}

function moduleLine(node: LayerNode): string | null {
  switch (node.layerType) {
    case "Conv2d":
      return `self.${node.name} = nn.Conv2d(${node.params.in_channels}, ${node.params.out_channels}, ${tupleToPython(node.params.kernel_size)}, ${tupleToPython(node.params.stride)}, ${tupleToPython(node.params.padding)}, dilation=${tupleToPython(node.params.dilation)}, bias=${String(node.params.bias)})`
    case "BatchNorm2d":
      return `self.${node.name} = nn.BatchNorm2d(${node.params.num_features})`
    case "ReLU":
      return `self.${node.name} = nn.ReLU(inplace=${String(node.params.inplace)})`
    case "MaxPool2d":
      return `self.${node.name} = nn.MaxPool2d(${tupleToPython(node.params.kernel_size)}, ${tupleToPython(node.params.stride)}, ${tupleToPython(node.params.padding)})`
    case "AdaptiveAvgPool2d":
      return `self.${node.name} = nn.AdaptiveAvgPool2d(${tupleToPython(node.params.output_size)})`
    case "Flatten":
      return `self.${node.name} = nn.Flatten(start_dim=${node.params.start_dim}, end_dim=${node.params.end_dim})`
    case "Linear":
      return `self.${node.name} = nn.Linear(${node.params.in_features}, ${node.params.out_features}, bias=${String(node.params.bias)})`
    case "Dropout":
      return `self.${node.name} = nn.Dropout(p=${node.params.p})`
    default:
      return null
  }
}

function forwardLine(node: LayerNode): string | null {
  switch (node.layerType) {
    case "Conv2d":
    case "BatchNorm2d":
    case "ReLU":
    case "MaxPool2d":
    case "AdaptiveAvgPool2d":
    case "Flatten":
    case "Linear":
    case "Dropout":
      return `x = self.${node.name}(x)`
    case "Output":
      return "return x"
    default:
      return null
  }
}

function findMainChain(graph: NeuralGraph): LayerNode[] {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]))
  const inputNode = graph.nodes.find((node) => node.layerType === "Input")

  if (!inputNode) {
    return []
  }

  const chain: LayerNode[] = [inputNode]
  const visited = new Set([inputNode.id])
  let current = inputNode

  while (current.layerType !== "Output") {
    const outgoing = getOutgoingEdges(graph, current.id)

    if (outgoing.length !== 1) {
      return []
    }

    const nextNode = nodeMap.get(outgoing[0].toNodeId)

    if (!nextNode || visited.has(nextNode.id)) {
      return []
    }

    chain.push(nextNode)
    visited.add(nextNode.id)
    current = nextNode
  }

  return chain
}

export function generatePyTorch(graph: NeuralGraph): string {
  const chain = findMainChain(graph)

  if (chain.length === 0) {
    return [
      "# Current MVP exporter supports a single linear Input -> ... -> Output path.",
      "# Adjust the graph to one main chain to get runnable PyTorch output.",
    ].join("\n")
  }

  const moduleLines = chain.map(moduleLine).filter((line): line is string => Boolean(line))
  const forwardLines = chain
    .slice(1)
    .map(forwardLine)
    .filter((line): line is string => Boolean(line))

  return [
    "import torch",
    "import torch.nn as nn",
    "",
    "",
    "class GeneratedNet(nn.Module):",
    "    def __init__(self):",
    "        super().__init__()",
    ...moduleLines.map((line) => `        ${line}`),
    "",
    "    def forward(self, x):",
    ...forwardLines.map((line) => `        ${line}`),
    "",
    "",
    "if __name__ == \"__main__\":",
    "    model = GeneratedNet()",
    "    x = torch.randn(1, 3, 224, 224)",
    "    y = model(x)",
    "    print(y.shape)",
  ].join("\n")
}
