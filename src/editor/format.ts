import type { TensorShape, TensorSpec } from "../core/graph/types"

export function formatTensorShape(shape: TensorShape): string {
  return `[${shape.map((dim) => String(dim)).join(", ")}]`
}

export function formatTensorSpec(spec: TensorSpec | undefined): string {
  if (!spec) {
    return "Unknown"
  }

  return `${spec.dtype} ${formatTensorShape(spec.shape)}`
}
