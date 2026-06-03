import type { GraphEdge, NeuralGraph } from "./types"

export function getIncomingEdges(graph: NeuralGraph, nodeId: string): GraphEdge[] {
  return graph.edges.filter((edge) => edge.toNodeId === nodeId)
}

export function getOutgoingEdges(graph: NeuralGraph, nodeId: string): GraphEdge[] {
  return graph.edges.filter((edge) => edge.fromNodeId === nodeId)
}

export function topologicalSort(graph: NeuralGraph): {
  orderedNodeIds: string[]
  hasCycle: boolean
} {
  const incomingCount = new Map<string, number>()
  const outgoingMap = new Map<string, string[]>()

  for (const node of graph.nodes) {
    incomingCount.set(node.id, 0)
    outgoingMap.set(node.id, [])
  }

  for (const edge of graph.edges) {
    incomingCount.set(edge.toNodeId, (incomingCount.get(edge.toNodeId) ?? 0) + 1)
    outgoingMap.get(edge.fromNodeId)?.push(edge.toNodeId)
  }

  const queue = graph.nodes
    .filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    .map((node) => node.id)

  const orderedNodeIds: string[] = []

  while (queue.length > 0) {
    const nodeId = queue.shift()

    if (!nodeId) {
      continue
    }

    orderedNodeIds.push(nodeId)

    for (const nextId of outgoingMap.get(nodeId) ?? []) {
      const nextCount = (incomingCount.get(nextId) ?? 1) - 1
      incomingCount.set(nextId, nextCount)

      if (nextCount === 0) {
        queue.push(nextId)
      }
    }
  }

  return {
    orderedNodeIds,
    hasCycle: orderedNodeIds.length !== graph.nodes.length,
  }
}
