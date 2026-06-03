import type {
  LayerCategory,
  LayerType,
  ParamValue,
  TensorDType,
} from "../graph/types"

export type ParamDef = {
  name: string
  label: string
  type: "number" | "string" | "boolean" | "select" | "tuple"
  default: ParamValue
  required?: boolean
  options?: string[]
  min?: number
  max?: number
}

export type PortDef = {
  name: string
  tensorRank?: number
}

export type LayerTypeDef = {
  type: LayerType
  label: string
  category: LayerCategory
  accent: string
  description: string
  inputs: PortDef[]
  outputs: PortDef[]
  params: ParamDef[]
}

const registryEntries: LayerTypeDef[] = [
  {
    type: "Input",
    label: "Input",
    category: "input",
    accent: "#2563eb",
    description: "Entry tensor for the graph.",
    inputs: [],
    outputs: [{ name: "out", tensorRank: 4 }],
    params: [
      {
        name: "shape",
        label: "Shape",
        type: "tuple",
        default: ["B", 3, 224, 224],
        required: true,
      },
      {
        name: "dtype",
        label: "DType",
        type: "select",
        default: "float32",
        required: true,
        options: ["float32", "float16", "int64"],
      },
    ],
  },
  {
    type: "Conv2d",
    label: "Conv2d",
    category: "conv",
    accent: "#ef4444",
    description: "2D convolution layer.",
    inputs: [{ name: "in", tensorRank: 4 }],
    outputs: [{ name: "out", tensorRank: 4 }],
    params: [
      { name: "in_channels", label: "In Channels", type: "number", default: 3, required: true, min: 1 },
      { name: "out_channels", label: "Out Channels", type: "number", default: 32, required: true, min: 1 },
      { name: "kernel_size", label: "Kernel", type: "tuple", default: [3, 3], required: true },
      { name: "stride", label: "Stride", type: "tuple", default: [1, 1], required: true },
      { name: "padding", label: "Padding", type: "tuple", default: [1, 1], required: true },
      { name: "dilation", label: "Dilation", type: "tuple", default: [1, 1], required: true },
      { name: "bias", label: "Bias", type: "boolean", default: true },
    ],
  },
  {
    type: "BatchNorm2d",
    label: "BatchNorm2d",
    category: "norm",
    accent: "#f59e0b",
    description: "Channel-wise normalization.",
    inputs: [{ name: "in", tensorRank: 4 }],
    outputs: [{ name: "out", tensorRank: 4 }],
    params: [{ name: "num_features", label: "Features", type: "number", default: 32, required: true, min: 1 }],
  },
  {
    type: "ReLU",
    label: "ReLU",
    category: "activation",
    accent: "#22c55e",
    description: "Non-linearity.",
    inputs: [{ name: "in" }],
    outputs: [{ name: "out" }],
    params: [{ name: "inplace", label: "Inplace", type: "boolean", default: true }],
  },
  {
    type: "MaxPool2d",
    label: "MaxPool2d",
    category: "pool",
    accent: "#8b5cf6",
    description: "Downsamples spatial features.",
    inputs: [{ name: "in", tensorRank: 4 }],
    outputs: [{ name: "out", tensorRank: 4 }],
    params: [
      { name: "kernel_size", label: "Kernel", type: "tuple", default: [2, 2], required: true },
      { name: "stride", label: "Stride", type: "tuple", default: [2, 2], required: true },
      { name: "padding", label: "Padding", type: "tuple", default: [0, 0], required: true },
    ],
  },
  {
    type: "AdaptiveAvgPool2d",
    label: "AdaptiveAvgPool2d",
    category: "pool",
    accent: "#6366f1",
    description: "Targets a fixed output size.",
    inputs: [{ name: "in", tensorRank: 4 }],
    outputs: [{ name: "out", tensorRank: 4 }],
    params: [{ name: "output_size", label: "Output Size", type: "tuple", default: [1, 1], required: true }],
  },
  {
    type: "Flatten",
    label: "Flatten",
    category: "reshape",
    accent: "#0ea5e9",
    description: "Flattens feature dimensions.",
    inputs: [{ name: "in" }],
    outputs: [{ name: "out", tensorRank: 2 }],
    params: [
      { name: "start_dim", label: "Start", type: "number", default: 1, required: true },
      { name: "end_dim", label: "End", type: "number", default: -1, required: true },
    ],
  },
  {
    type: "Linear",
    label: "Linear",
    category: "linear",
    accent: "#ec4899",
    description: "Fully connected layer.",
    inputs: [{ name: "in", tensorRank: 2 }],
    outputs: [{ name: "out", tensorRank: 2 }],
    params: [
      { name: "in_features", label: "In Features", type: "number", default: 401408, required: true, min: 1 },
      { name: "out_features", label: "Out Features", type: "number", default: 10, required: true, min: 1 },
      { name: "bias", label: "Bias", type: "boolean", default: true },
    ],
  },
  {
    type: "Dropout",
    label: "Dropout",
    category: "linear",
    accent: "#14b8a6",
    description: "Randomly zeroes features during training.",
    inputs: [{ name: "in" }],
    outputs: [{ name: "out" }],
    params: [{ name: "p", label: "Drop Prob", type: "number", default: 0.5, required: true, min: 0, max: 1 }],
  },
  {
    type: "Add",
    label: "Add",
    category: "merge",
    accent: "#f97316",
    description: "Elementwise merge with matching shapes.",
    inputs: [{ name: "a" }, { name: "b" }],
    outputs: [{ name: "out" }],
    params: [],
  },
  {
    type: "Concat",
    label: "Concat",
    category: "merge",
    accent: "#84cc16",
    description: "Concatenate tensors on a target dimension.",
    inputs: [{ name: "a" }, { name: "b" }],
    outputs: [{ name: "out" }],
    params: [{ name: "dim", label: "Dim", type: "number", default: 1, required: true }],
  },
  {
    type: "Output",
    label: "Output",
    category: "output",
    accent: "#334155",
    description: "Graph sink node.",
    inputs: [{ name: "in" }],
    outputs: [],
    params: [],
  },
]

export const layerRegistry = new Map<LayerType, LayerTypeDef>(
  registryEntries.map((entry) => [entry.type, entry]),
)

export const layerLibrary = registryEntries

export function getLayerDef(type: LayerType): LayerTypeDef {
  const layerDef = layerRegistry.get(type)

  if (!layerDef) {
    throw new Error(`Unknown layer type: ${type}`)
  }

  return layerDef
}

export function createDefaultParams(type: LayerType): Record<string, ParamValue> {
  const layerDef = getLayerDef(type)

  return Object.fromEntries(
    layerDef.params.map((param) => [
      param.name,
      Array.isArray(param.default) ? [...param.default] : param.default,
    ]),
  )
}

export function coerceDtype(value: ParamValue): TensorDType {
  if (value === "float16" || value === "int64") {
    return value
  }

  return "float32"
}
