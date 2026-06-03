import { type Locale, getUiText } from "../i18n"

type ExportPanelProps = {
  locale: Locale
  graphJson: string
  pythonCode: string
  draftJson: string
  onDraftJsonChange: (value: string) => void
  onImportJson: () => void
  onImportModelFile: (file: File) => void
  onCopyPyTorch: () => void
  onCopyJson: () => void
}

export function ExportPanel({
  locale,
  graphJson,
  pythonCode,
  draftJson,
  onDraftJsonChange,
  onImportJson,
  onImportModelFile,
  onCopyPyTorch,
  onCopyJson,
}: ExportPanelProps) {
  const text = getUiText(locale)

  return (
    <section className="panel export-panel">
      <div className="panel__header">
        <h2>{text.exportTitle}</h2>
        <p>{text.exportDescription}</p>
      </div>

      <div className="export-actions">
        <button type="button" onClick={onCopyJson}>
          {text.copyJson}
        </button>
        <button type="button" onClick={onCopyPyTorch}>
          {text.copyPyTorch}
        </button>
        <button type="button" onClick={onImportJson}>
          {text.loadDraftJson}
        </button>
        <label className="file-action">
          <input
            type="file"
            accept=".json,.py,.txt,.onnx,.pb"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                onImportModelFile(file)
                event.currentTarget.value = ""
              }
            }}
          />
          <span>{text.importModelFile}</span>
        </label>
      </div>

      <div className="code-stack">
        <label className="code-block">
          <span>PyTorch</span>
          <textarea readOnly value={pythonCode} />
        </label>
        <label className="code-block">
          <span>{text.graphJson}</span>
          <textarea readOnly value={graphJson} />
        </label>
        <label className="code-block">
          <span>{text.importDraft}</span>
          <textarea value={draftJson} onChange={(event) => onDraftJsonChange(event.target.value)} />
        </label>
      </div>
    </section>
  )
}
