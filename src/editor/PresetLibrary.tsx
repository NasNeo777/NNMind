import type { GraphPreset } from "../examples/modelPresets"
import { type Locale, getPresetCopy, getUiText } from "../i18n"

type PresetLibraryProps = {
  locale: Locale
  presets: GraphPreset[]
  onLoadPreset: (preset: GraphPreset) => void
}

export function PresetLibrary({ locale, presets, onLoadPreset }: PresetLibraryProps) {
  const text = getUiText(locale)

  return (
    <section className="panel preset-panel">
      <div className="panel__header">
        <h2>{text.presetTitle}</h2>
        <p>{text.presetDescription}</p>
      </div>
      <div className="preset-grid">
        {presets.map((preset) => {
          const copy = getPresetCopy(
            preset.id,
            {
              title: preset.title,
              family: preset.family,
              description: preset.description,
            },
            locale,
          )

          return (
            <button key={preset.id} type="button" className="preset-card" onClick={() => onLoadPreset(preset)}>
              <span className="preset-card__family">{copy.family}</span>
              <strong>{copy.title}</strong>
              <span className="preset-card__description">{copy.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
