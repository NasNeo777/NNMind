import type { Edge, XYPosition } from "@xyflow/react"
import { nanoid } from "nanoid"
import type { GraphEdge, GraphLayoutMode, LayerNode, LayerType, NeuralGraph } from "../core/graph/types"
import { createDefaultParams, getLayerDef } from "../core/registry/layerRegistry"
import { getPortPositions, orientPosition } from "./layout"
import type { CanvasNode } from "./types"

export function buildCanvasNode(
  layerType: LayerType,
  index: number,
  layoutMode: GraphLayoutMode,
  position: XYPosition = orientPosition(120 + index * 220, 120 + (index % 3) * 120, layoutMode),
): CanvasNode {
  const layerDef = getLayerDef(layerType)
  const id = nanoid(8)
  const name = layerType === "Input" || layerType === "Output" ? layerType.toLowerCase() : `${layerType.toLowerCase()}_${index + 1}`
  const { source, target } = getPortPositions(layoutMode)

  return {
    id,
    type: "layerNode",
    position,
    sourcePosition: source,
    targetPosition: target,
    data: {
      name,
      layerType,
      params: createDefaultParams(layerType),
      accent: layerDef.accent,
      label: layerDef.label,
      description: layerDef.description,
      layoutMode,
    },
  }
}

export function graphToCanvasNodes(graph: NeuralGraph, layoutMode: GraphLayoutMode): CanvasNode[] {
  const { source, target } = getPortPositions(layoutMode)

  return graph.nodes.map((node) => {
    const layerDef = getLayerDef(node.layerType)
    const position = orientPosition(node.position.x, node.position.y, layoutMode)

    return {
      id: node.id,
      type: "layerNode",
      position,
      sourcePosition: source,
      targetPosition: target,
      data: {
        name: node.name,
        layerType: node.layerType,
        params: node.params,
        accent: layerDef.accent,
        label: layerDef.label,
        description: layerDef.description,
        layoutMode,
      },
    }
  })
}

export function graphToCanvasEdges(graph: NeuralGraph): Edge[] {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.fromNodeId,
    target: edge.toNodeId,
    sourceHandle: edge.fromPort,
    targetHandle: edge.toPort,
    animated: false,
  }))
}

export function canvasToGraph(nodes: CanvasNode[], edges: Edge[]): NeuralGraph {
  const graphNodes: LayerNode[] = nodes.map((node) => ({
    id: node.id,
    name: node.data.name,
    layerType: node.data.layerType,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    params: node.data.params,
  }))

  const graphEdges: GraphEdge[] = edges.map((edge) => ({
    id: edge.id,
    fromNodeId: edge.source,
    fromPort: edge.sourceHandle ?? "out",
    toNodeId: edge.target,
    toPort: edge.targetHandle ?? "in",
  }))

  return {
    version: 1,
    framework: "pytorch",
    nodes: graphNodes,
    edges: graphEdges,
  }
}
