import type { CSSProperties } from "react"
import { useMemo, useState } from "react"
import { layerLibrary } from "../core/registry/layerRegistry"
import type { LayerType } from "../core/graph/types"

type LayerPaletteProps = {
  onAddLayer: (layerType: LayerType) => void
  selectedNodeName?: string
}

export function LayerPalette({ onAddLayer, selectedNodeName }: LayerPaletteProps) {
  const [query, setQuery] = useState("")

  const filteredLayers = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return keyword
      ? layerLibrary.filter(
          (layer) =>
            layer.label.toLowerCase().includes(keyword) ||
            layer.type.toLowerCase().includes(keyword) ||
            layer.category.toLowerCase().includes(keyword) ||
            layer.description.toLowerCase().includes(keyword),
        )
      : layerLibrary
  }, [query])

  return (
    <section className="panel quick-add-panel">
      <div className="quick-add-header">
        <div className="panel__header">
          <h2>Quick Add</h2>
          <p>{selectedNodeName ? `选中 ${selectedNodeName} 后，新节点会插到它后面。` : "先选一个节点，再从这里横向快速加入常用模块。"}</p>
        </div>
        <label className="field quick-add-search">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="conv, bottleneck, attention, lstm..." />
        </label>
      </div>
      <div className="quick-add-row">
        {filteredLayers.map((layer) => (
          <button
            key={layer.type}
            type="button"
            className="quick-add-card"
            onClick={() => onAddLayer(layer.type)}
            style={{ "--accent": layer.accent } as CSSProperties}
            title={layer.description}
          >
            <span className="quick-add-card__label">{layer.label}</span>
            <span className="quick-add-card__meta">{layer.category}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
