import type { Node } from "@xyflow/react"
import type { GraphIssue, GraphLayoutMode, LayerType, ParamValue, TensorSpec } from "../core/graph/types"
import type { Locale } from "../i18n"

export type CanvasNodeData = {
  name: string
  layerType: LayerType
  params: Record<string, ParamValue>
  accent: string
  label: string
  description: string
  layoutMode: GraphLayoutMode
  locale?: Locale
  paramCount?: number
  specs?: {
    inputs: Array<TensorSpec | null>
    outputs: TensorSpec[]
  }
  issueLevel?: GraphIssue["level"]
}

export type CanvasNode = Node<CanvasNodeData, "layerNode">
