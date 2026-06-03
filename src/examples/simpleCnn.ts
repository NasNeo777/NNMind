import type { NeuralGraph } from "../core/graph/types"
import { createDefaultParams } from "../core/registry/layerRegistry"

export const simpleCnnGraph: NeuralGraph = {
  version: 1,
  framework: "pytorch",
  nodes: [
    {
      id: "input",
      name: "input",
      layerType: "Input",
      position: { x: 0, y: 120 },
      params: createDefaultParams("Input"),
    },
  ],
  edges: [],
}
