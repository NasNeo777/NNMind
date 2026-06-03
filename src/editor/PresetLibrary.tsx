import type { GraphPreset } from "../examples/modelPresets"

type PresetLibraryProps = {
  presets: GraphPreset[]
  onLoadPreset: (preset: GraphPreset) => void
}

export function PresetLibrary({ presets, onLoadPreset }: PresetLibraryProps) {
  return (
    <section className="panel preset-panel">
      <div className="panel__header">
        <h2>Model Presets</h2>
        <p>一键载入经典 CNN、序列模型和 Transformer 编解码骨架。</p>
      </div>
      <div className="preset-grid">
        {presets.map((preset) => (
          <button key={preset.id} type="button" className="preset-card" onClick={() => onLoadPreset(preset)}>
            <span className="preset-card__family">{preset.family}</span>
            <strong>{preset.title}</strong>
            <span className="preset-card__description">{preset.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
