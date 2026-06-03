type ExportPanelProps = {
  graphJson: string
  pythonCode: string
  draftJson: string
  onDraftJsonChange: (value: string) => void
  onImportJson: () => void
  onCopyPyTorch: () => void
  onCopyJson: () => void
}

export function ExportPanel({
  graphJson,
  pythonCode,
  draftJson,
  onDraftJsonChange,
  onImportJson,
  onCopyPyTorch,
  onCopyJson,
}: ExportPanelProps) {
  return (
    <section className="panel export-panel">
      <div className="panel__header">
        <h2>Export</h2>
        <p>同一份图数据同时驱动 JSON 保存和 PyTorch 导出。</p>
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
