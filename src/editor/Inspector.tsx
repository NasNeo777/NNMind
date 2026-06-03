import { getLayerDef } from "../core/registry/layerRegistry"
import type { ParamValue } from "../core/graph/types"
import { formatTensorSpec } from "./format"
import type { CanvasNode } from "./types"

type InspectorProps = {
  node?: CanvasNode
  onUpdateName: (name: string) => void
  onUpdateParam: (paramName: string, value: ParamValue) => void
}

function TupleInput({
  value,
  onChange,
}: {
  value: ParamValue
  onChange: (next: ParamValue) => void
}) {
  const tuple = Array.isArray(value) ? value : []

  return (
    <div className="tuple-input">
      {tuple.map((item, index) => (
        <input
          key={`${index}-${String(item)}`}
          value={String(item)}
          onChange={(event) => {
            const next = [...tuple]
            const raw = event.target.value.trim()
            next[index] = raw === "B" ? "B" : raw === "" ? null : Number.isNaN(Number(raw)) ? raw : Number(raw)
            onChange(next)
          }}
        />
      ))}
    </div>
  )
}

export function Inspector({ node, onUpdateName, onUpdateParam }: InspectorProps) {
  if (!node) {
    return (
      <section className="panel inspector-panel">
        <div className="panel__header">
          <h2>Inspector</h2>
          <p>选择一个节点后，这里会出现参数面板。</p>
        </div>
      </section>
    )
  }

  const layerDef = getLayerDef(node.data.layerType)

  return (
    <section className="panel inspector-panel">
      <div className="panel__header">
        <h2>{node.data.label}</h2>
        <p>{node.data.description}</p>
      </div>

      <label className="field">
        <span>Name</span>
        <input value={node.data.name} onChange={(event) => onUpdateName(event.target.value)} />
      </label>

      {layerDef.params.map((param) => {
        const value = node.data.params[param.name]

        if (param.type === "boolean") {
          return (
            <label key={param.name} className="field field--checkbox">
              <span>{param.label}</span>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => onUpdateParam(param.name, event.target.checked)}
              />
            </label>
          )
        }

        if (param.type === "select") {
          return (
            <label key={param.name} className="field">
              <span>{param.label}</span>
              <select value={String(value)} onChange={(event) => onUpdateParam(param.name, event.target.value)}>
                {param.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )
        }

        if (param.type === "tuple") {
          return (
            <label key={param.name} className="field">
              <span>{param.label}</span>
              <TupleInput value={value} onChange={(next) => onUpdateParam(param.name, next)} />
            </label>
          )
        }

        return (
          <label key={param.name} className="field">
            <span>{param.label}</span>
            <input
              value={String(value)}
              onChange={(event) => {
                const raw = event.target.value
                onUpdateParam(param.name, param.type === "number" ? Number(raw) : raw)
              }}
            />
          </label>
        )
      })}

      <div className="inspector-specs">
        <div>
          <strong>Input</strong>
          <span>{formatTensorSpec(node.data.specs?.inputs[0])}</span>
        </div>
        <div>
          <strong>Output</strong>
          <span>{formatTensorSpec(node.data.specs?.outputs[0])}</span>
        </div>
      </div>
    </section>
  )
}
