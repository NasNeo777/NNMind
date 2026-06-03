import type { Node } from "@xyflow/react"
import type { GraphIssue, LayerType, ParamValue, TensorSpec } from "../core/graph/types"

export type CanvasNodeData = {
  name: string
  layerType: LayerType
  params: Record<string, ParamValue>
  accent: string
  label: string
  description: string
  specs?: {
    inputs: TensorSpec[]
    outputs: TensorSpec[]
  }
  issueLevel?: GraphIssue["level"]
}

export type CanvasNode = Node<CanvasNodeData, "layerNode">
