import type { CSSProperties } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { getLayerDef } from "../core/registry/layerRegistry"
import { formatTensorSpec } from "./format"
import type { CanvasNode } from "./types"

export function LayerNode({ data, selected }: NodeProps<CanvasNode>) {
  const layerDef = getLayerDef(data.layerType)
  const inputSpec = data.specs?.inputs[0]
  const outputSpec = data.specs?.outputs[0]

  return (
    <article
      className={`layer-node ${selected ? "is-selected" : ""} ${data.issueLevel ? `has-${data.issueLevel}` : ""}`}
      style={{ "--accent": data.accent } as CSSProperties}
    >
      {layerDef.inputs.length > 0 ? <Handle type="target" position={Position.Left} id="in" /> : null}
      {layerDef.outputs.length > 0 ? <Handle type="source" position={Position.Right} id="out" /> : null}

      <div className="layer-node__top">
        <span className="layer-node__kind">{data.label}</span>
        <span className="layer-node__name">{data.name}</span>
      </div>
      <p className="layer-node__description">{data.description}</p>
      <div className="layer-node__shapes">
        <span>{formatTensorSpec(inputSpec)}</span>
        <span>{formatTensorSpec(outputSpec)}</span>
      </div>
    </article>
  )
}
