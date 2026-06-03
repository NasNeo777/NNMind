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

  const filteredGroups = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = keyword
      ? layerLibrary.filter(
          (layer) =>
            layer.label.toLowerCase().includes(keyword) ||
            layer.type.toLowerCase().includes(keyword) ||
            layer.category.toLowerCase().includes(keyword) ||
            layer.description.toLowerCase().includes(keyword),
        )
      : layerLibrary

    return Object.entries(
      filtered.reduce<Record<string, typeof filtered>>((groups, layer) => {
        if (!groups[layer.category]) {
          groups[layer.category] = []
        }
        groups[layer.category].push(layer)
        return groups
      }, {}),
    )
  }, [query])

  return (
    <section className="panel palette-panel">
      <div className="panel__header">
        <h2>Layer Palette</h2>
        <p>{selectedNodeName ? `选中 ${selectedNodeName} 后，新节点会尽量插到它后面。` : "搜索并添加节点；选中节点后会优先插到该节点后面。"}</p>
      </div>
      <label className="field">
        <span>Search</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="conv, transformer, lstm..." />
      </label>
      <div className="palette-groups">
        {filteredGroups.map(([groupName, layers]) => (
          <section key={groupName} className="palette-group">
            <div className="palette-group__title">{groupName}</div>
            <div className="palette-grid">
              {layers.map((layer) => (
                <button
                  key={layer.type}
                  type="button"
                  className="palette-card"
                  onClick={() => onAddLayer(layer.type)}
                  style={{ "--accent": layer.accent } as CSSProperties}
                >
                  <span className="palette-card__label">{layer.label}</span>
                  <span className="palette-card__meta">{layer.category}</span>
                  <span className="palette-card__hint">{layer.description}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
