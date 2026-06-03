import type { NeuralGraph } from "../graph/types"

export function serializeGraph(graph: NeuralGraph): string {
  return JSON.stringify(graph, null, 2)
}

export function parseGraphJson(raw: string): NeuralGraph {
  const parsed = JSON.parse(raw) as NeuralGraph

  if (!parsed || parsed.framework !== "pytorch" || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("无效的图 JSON 格式。")
  }

  return parsed
}
