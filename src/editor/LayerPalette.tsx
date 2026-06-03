import type { CSSProperties } from "react"
import { layerLibrary } from "../core/registry/layerRegistry"
import type { LayerType } from "../core/graph/types"

type LayerPaletteProps = {
  onAddLayer: (layerType: LayerType) => void
}

export function LayerPalette({ onAddLayer }: LayerPaletteProps) {
  return (
    <section className="panel palette-panel">
      <div className="panel__header">
        <h2>Layer Palette</h2>
        <p>从这里添加节点，先把 CNN 主链路跑通。</p>
      </div>
      <div className="palette-grid">
        {layerLibrary.map((layer) => (
          <button
            key={layer.type}
            type="button"
            className="palette-card"
            onClick={() => onAddLayer(layer.type)}
            style={{ "--accent": layer.accent } as CSSProperties}
          >
            <span className="palette-card__label">{layer.label}</span>
            <span className="palette-card__meta">{layer.category}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
