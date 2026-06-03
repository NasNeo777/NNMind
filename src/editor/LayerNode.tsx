import type { CSSProperties } from "react"
import { Handle, type NodeProps } from "@xyflow/react"
import { formatParamCount } from "../core/graph/paramCount"
import { getLayerDef } from "../core/registry/layerRegistry"
import { formatTensorSpec } from "./format"
import { getPortPositions } from "./layout"
import type { CanvasNode } from "./types"

function handleStyle(index: number, total: number, layoutMode: CanvasNode["data"]["layoutMode"]): CSSProperties {
  const offset = `${((index + 1) / (total + 1)) * 100}%`

  return layoutMode === "vertical"
    ? { left: offset }
    : { top: offset }
}

export function LayerNode({ data, selected }: NodeProps<CanvasNode>) {
  const layerDef = getLayerDef(data.layerType)
  const portPositions = getPortPositions(data.layoutMode)

  return (
    <article
      className={`layer-node ${selected ? "is-selected" : ""} ${data.issueLevel ? `has-${data.issueLevel}` : ""}`}
      style={{ "--accent": data.accent } as CSSProperties}
    >
      {layerDef.inputs.map((port, index) => (
        <Handle
          key={`target-${port.name}`}
          type="target"
          position={portPositions.target}
          id={port.name}
          style={handleStyle(index, layerDef.inputs.length, data.layoutMode)}
        />
      ))}

      {layerDef.outputs.map((port, index) => (
        <Handle
          key={`source-${port.name}`}
          type="source"
          position={portPositions.source}
          id={port.name}
          style={handleStyle(index, layerDef.outputs.length, data.layoutMode)}
        />
      ))}

      <div className="layer-node__top">
        <span className="layer-node__kind">{data.label}</span>
        <span className="layer-node__name">{data.name}</span>
      </div>
      <p className="layer-node__description">{data.description}</p>
      <div className="layer-node__param-count">{formatParamCount(data.paramCount ?? 0)} params</div>
      <div className="layer-node__ports">
        {layerDef.inputs.map((port, index) => (
          <span key={`in-${port.name}`}>
            {port.name}: {formatTensorSpec(data.specs?.inputs[index])}
          </span>
        ))}
        {layerDef.outputs.map((port, index) => (
          <span key={`out-${port.name}`}>
            {port.name}: {formatTensorSpec(data.specs?.outputs[index])}
          </span>
        ))}
      </div>
    </article>
  )
}
