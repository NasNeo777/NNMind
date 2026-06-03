import { getLayerDef } from "../core/registry/layerRegistry"
import { formatParamCount } from "../core/graph/paramCount"
import type { ParamValue } from "../core/graph/types"
import {
  type Locale,
  formatExactParamCount,
  getLayerDescription,
  getLayerLabel,
  getParamLabel,
  getUiText,
} from "../i18n"
import { formatTensorSpec } from "./format"
import type { CanvasNode } from "./types"

type InspectorProps = {
  locale: Locale
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

export function Inspector({ locale, node, onUpdateName, onUpdateParam }: InspectorProps) {
  const text = getUiText(locale)

  if (!node) {
    return (
      <section className="panel inspector-panel">
        <div className="panel__header">
          <h2>{text.inspectorTitle}</h2>
          <p>{text.inspectorEmpty}</p>
        </div>
      </section>
    )
  }

  const layerDef = getLayerDef(node.data.layerType)
  const label = getLayerLabel(node.data.layerType, node.data.label, locale)
  const description = getLayerDescription(node.data.layerType, node.data.description, locale)
  const paramCount = node.data.paramCount ?? 0

  return (
    <section className="panel inspector-panel">
      <div className="panel__header">
        <h2>{label}</h2>
        <p>{description}</p>
        <p className="panel__meta">
          {formatParamCount(paramCount)} {text.params} · {text.exactParams} {formatExactParamCount(locale, paramCount)}
        </p>
      </div>

      <label className="field">
        <span>{text.nodeName}</span>
        <input value={node.data.name} onChange={(event) => onUpdateName(event.target.value)} />
      </label>

      {layerDef.params.map((param) => {
        const value = node.data.params[param.name]
        const paramLabel = getParamLabel(param.name, param.label, locale)

        if (param.type === "boolean") {
          return (
            <label key={param.name} className="field field--checkbox">
              <span>{paramLabel}</span>
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
              <span>{paramLabel}</span>
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
              <span>{paramLabel}</span>
              <TupleInput value={value} onChange={(next) => onUpdateParam(param.name, next)} />
            </label>
          )
        }

        return (
          <label key={param.name} className="field">
            <span>{paramLabel}</span>
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
        {layerDef.inputs.map((port, index) => (
          <div key={`input-${port.name}`}>
            <strong>
              {text.inputPort} · {port.name}
            </strong>
            <span>{formatTensorSpec(node.data.specs?.inputs[index])}</span>
          </div>
        ))}
        {layerDef.outputs.map((port, index) => (
          <div key={`output-${port.name}`}>
            <strong>
              {text.outputPort} · {port.name}
            </strong>
            <span>{formatTensorSpec(node.data.specs?.outputs[index])}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
