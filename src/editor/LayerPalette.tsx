import type { CSSProperties } from "react"
import { useMemo, useState } from "react"
import { layerLibrary } from "../core/registry/layerRegistry"
import type { LayerType } from "../core/graph/types"
import {
  type Locale,
  getLayerCategoryLabel,
  getLayerDescription,
  getLayerLabel,
  getUiText,
} from "../i18n"

type LayerPaletteProps = {
  locale: Locale
  onAddLayer: (layerType: LayerType) => void
  selectedNodeName?: string
}

export function LayerPalette({ locale, onAddLayer, selectedNodeName }: LayerPaletteProps) {
  const [query, setQuery] = useState("")
  const text = getUiText(locale)

  const filteredLayers = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return keyword
      ? layerLibrary.filter(
          (layer) => {
            const localizedLabel = getLayerLabel(layer.type, layer.label, locale).toLowerCase()
            const localizedCategory = getLayerCategoryLabel(layer.category, locale).toLowerCase()
            const localizedDescription = getLayerDescription(layer.type, layer.description, locale).toLowerCase()

            return (
              layer.label.toLowerCase().includes(keyword) ||
              layer.type.toLowerCase().includes(keyword) ||
              layer.category.toLowerCase().includes(keyword) ||
              layer.description.toLowerCase().includes(keyword) ||
              localizedLabel.includes(keyword) ||
              localizedCategory.includes(keyword) ||
              localizedDescription.includes(keyword)
            )
          },
        )
      : layerLibrary
  }, [locale, query])

  return (
    <section className="panel quick-add-panel">
      <div className="quick-add-header">
        <div className="panel__header">
          <h2>{text.quickAddTitle}</h2>
          <p>{selectedNodeName ? text.quickAddHintSelected(selectedNodeName) : text.quickAddHintIdle}</p>
        </div>
        <label className="field quick-add-search">
          <span>{text.search}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} />
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
            title={getLayerDescription(layer.type, layer.description, locale)}
          >
            <span className="quick-add-card__label">{getLayerLabel(layer.type, layer.label, locale)}</span>
            <span className="quick-add-card__meta">{getLayerCategoryLabel(layer.category, locale)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
