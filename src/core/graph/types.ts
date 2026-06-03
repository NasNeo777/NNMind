export type TensorDim = number | "B" | null

export type TensorShape = TensorDim[]

export type TensorDType = "float32" | "float16" | "int64"

export type TensorSpec = {
  dtype: TensorDType
  shape: TensorShape
}

export type LayerType =
  | "Input"
  | "Conv2d"
  | "BatchNorm2d"
  | "ReLU"
  | "MaxPool2d"
  | "AdaptiveAvgPool2d"
  | "Flatten"
  | "Linear"
  | "Dropout"
  | "Add"
  | "Concat"
  | "Output"

export type LayerCategory =
  | "input"
  | "conv"
  | "norm"
  | "activation"
  | "pool"
  | "reshape"
  | "linear"
  | "merge"
  | "output"

export type ParamValue =
  | string
  | number
  | boolean
  | null
  | Array<string | number | null>

export type LayerNode = {
  id: string
  name: string
  layerType: LayerType
  position: {
    x: number
    y: number
    z?: number
  }
  params: Record<string, ParamValue>
  inputSpecs?: TensorSpec[]
  outputSpecs?: TensorSpec[]
}

export type GraphEdge = {
  id: string
  fromNodeId: string
  fromPort: string
  toNodeId: string
  toPort: string
}

export type NeuralGraph = {
  version: number
  framework: "pytorch"
  nodes: LayerNode[]
  edges: GraphEdge[]
}

export type GraphIssue = {
  level: "error" | "warning" | "info"
  nodeId?: string
  edgeId?: string
  message: string
}

export type InferenceResult = {
  orderedNodeIds: string[]
  specsByNodeId: Record<
    string,
    {
      inputs: TensorSpec[]
      outputs: TensorSpec[]
    }
  >
  issues: GraphIssue[]
}
