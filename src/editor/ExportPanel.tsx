type ExportPanelProps = {
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
  graphJson,
  pythonCode,
  draftJson,
  onDraftJsonChange,
  onImportJson,
  onImportModelFile,
  onCopyPyTorch,
  onCopyJson,
}: ExportPanelProps) {
  return (
    <section className="panel export-panel">
      <div className="panel__header">
        <h2>Export & Import</h2>
        <p>支持导出 Graph JSON / PyTorch，也支持导入 Graph JSON 或常见 PyTorch `.py` 模型文件。</p>
      </div>

      <div className="export-actions">
        <button type="button" onClick={onCopyJson}>
          Copy JSON
        </button>
        <button type="button" onClick={onCopyPyTorch}>
          Copy PyTorch
        </button>
        <button type="button" onClick={onImportJson}>
          Load Draft JSON
        </button>
        <label className="file-action">
          <input
            type="file"
            accept=".json,.py,.txt"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                onImportModelFile(file)
                event.currentTarget.value = ""
              }
            }}
          />
          <span>Import Model File</span>
        </label>
      </div>

      <div className="code-stack">
        <label className="code-block">
          <span>PyTorch</span>
          <textarea readOnly value={pythonCode} />
        </label>
        <label className="code-block">
          <span>Graph JSON</span>
          <textarea readOnly value={graphJson} />
        </label>
        <label className="code-block">
          <span>Import Draft</span>
          <textarea value={draftJson} onChange={(event) => onDraftJsonChange(event.target.value)} />
        </label>
      </div>
    </section>
  )
}
