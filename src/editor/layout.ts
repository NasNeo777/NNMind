import { Position } from "@xyflow/react"
import type { GraphLayoutMode } from "../core/graph/types"
import type { CanvasNode } from "./types"

export function getPortPositions(layoutMode: GraphLayoutMode) {
  return layoutMode === "vertical"
    ? { source: Position.Bottom, target: Position.Top }
    : { source: Position.Right, target: Position.Left }
}

export function orientPosition(x: number, y: number, layoutMode: GraphLayoutMode) {
  return layoutMode === "vertical" ? { x: y, y: x } : { x, y }
}

export function applyLayoutModeToNodes(nodes: CanvasNode[], layoutMode: GraphLayoutMode): CanvasNode[] {
  const minX = Math.min(...nodes.map((node) => node.position.x))
  const minY = Math.min(...nodes.map((node) => node.position.y))
  const { source, target } = getPortPositions(layoutMode)

  return nodes.map((node) => {
    const relativeX = node.position.x - minX
    const relativeY = node.position.y - minY
    const nextPosition = { x: 140 + relativeY, y: 120 + relativeX }

    return {
      ...node,
      position: nextPosition,
      sourcePosition: source,
      targetPosition: target,
      data: {
        ...node.data,
        layoutMode,
      },
    }
  })
}
