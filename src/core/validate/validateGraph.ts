import { getIncomingEdges, getOutgoingEdges, topologicalSort } from "../graph/utils"
import type { GraphIssue, NeuralGraph } from "../graph/types"
import { getLayerDef } from "../registry/layerRegistry"
import { inferGraph } from "../shape/inferShape"

export function validateGraph(graph: NeuralGraph): GraphIssue[] {
  const issues: GraphIssue[] = []
  const inputNodes = graph.nodes.filter((node) => node.layerType === "Input")
  const outputNodes = graph.nodes.filter((node) => node.layerType === "Output")

  if (inputNodes.length === 0) {
    issues.push({ level: "error", message: "图中至少需要一个 Input 节点。" })
  }

  if (inputNodes.length > 1) {
    issues.push({ level: "info", message: "当前图包含多个 Input 节点，适合编解码器等多输入结构。" })
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
    const layerDef = getLayerDef(node.layerType)

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

    if (node.layerType !== "Input" && incoming.length < layerDef.inputs.length) {
      issues.push({
        level: "warning",
        nodeId: node.id,
        message: `${node.name} 需要 ${layerDef.inputs.length} 个输入端口，当前只有 ${incoming.length} 个连接。`,
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
