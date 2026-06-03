import { getIncomingEdges, getOutgoingEdges, topologicalSort } from "../graph/utils"
import type { GraphIssue, NeuralGraph } from "../graph/types"
import { inferGraph } from "../shape/inferShape"

export function validateGraph(graph: NeuralGraph): GraphIssue[] {
  const issues: GraphIssue[] = []
  const inputNodes = graph.nodes.filter((node) => node.layerType === "Input")
  const outputNodes = graph.nodes.filter((node) => node.layerType === "Output")

  if (inputNodes.length === 0) {
    issues.push({ level: "error", message: "图中至少需要一个 Input 节点。" })
  }

  if (inputNodes.length > 1) {
    issues.push({ level: "warning", message: "当前存在多个 Input 节点，MVP codegen 只保证单输入主链路。" })
  }

  if (outputNodes.length === 0) {
    issues.push({ level: "error", message: "图中至少需要一个 Output 节点。" })
  }

  const { hasCycle } = topologicalSort(graph)

  if (hasCycle) {
    issues.push({ level: "error", message: "图中存在环路。请移除循环连接。" })
  }

  for (const node of graph.nodes) {
    const incoming = getIncomingEdges(graph, node.id)
    const outgoing = getOutgoingEdges(graph, node.id)
    const isConnected = incoming.length > 0 || outgoing.length > 0

    if (!isConnected) {
      issues.push({
        level: "warning",
        nodeId: node.id,
        message: `${node.name} 是孤立节点。`,
      })
    }

    if (node.layerType === "Input" && incoming.length > 0) {
      issues.push({
        level: "error",
        nodeId: node.id,
        message: "Input 不应该有入边。",
      })
    }

    if (node.layerType === "Output" && outgoing.length > 0) {
      issues.push({
        level: "error",
        nodeId: node.id,
        message: "Output 不应该有出边。",
      })
    }
  }

  const inference = inferGraph(graph)
  issues.push(...inference.issues)

  for (const node of graph.nodes) {
    if (node.layerType === "Flatten") {
      const features = inference.specsByNodeId[node.id]?.outputs[0]?.shape[1]

      if (typeof features === "number" && features > 65536) {
        issues.push({
          level: "warning",
          nodeId: node.id,
          message: `Flatten 后特征数较大 (${features})，建议考虑 AdaptiveAvgPool2d。`,
        })
      }
    }
  }

  return issues
}
