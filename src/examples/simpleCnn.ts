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
    {
      id: "conv1",
      name: "conv1",
      layerType: "Conv2d",
      position: { x: 250, y: 120 },
      params: createDefaultParams("Conv2d"),
    },
    {
      id: "relu1",
      name: "relu1",
      layerType: "ReLU",
      position: { x: 500, y: 120 },
      params: createDefaultParams("ReLU"),
    },
    {
      id: "pool1",
      name: "pool1",
      layerType: "MaxPool2d",
      position: { x: 750, y: 120 },
      params: createDefaultParams("MaxPool2d"),
    },
    {
      id: "flatten",
      name: "flatten",
      layerType: "Flatten",
      position: { x: 1000, y: 120 },
      params: createDefaultParams("Flatten"),
    },
    {
      id: "fc",
      name: "fc",
      layerType: "Linear",
      position: { x: 1250, y: 120 },
      params: createDefaultParams("Linear"),
    },
    {
      id: "output",
      name: "output",
      layerType: "Output",
      position: { x: 1500, y: 120 },
      params: createDefaultParams("Output"),
    },
  ],
  edges: [
    { id: "e-input-conv1", fromNodeId: "input", fromPort: "out", toNodeId: "conv1", toPort: "in" },
    { id: "e-conv1-relu1", fromNodeId: "conv1", fromPort: "out", toNodeId: "relu1", toPort: "in" },
    { id: "e-relu1-pool1", fromNodeId: "relu1", fromPort: "out", toNodeId: "pool1", toPort: "in" },
    { id: "e-pool1-flatten", fromNodeId: "pool1", fromPort: "out", toNodeId: "flatten", toPort: "in" },
    { id: "e-flatten-fc", fromNodeId: "flatten", fromPort: "out", toNodeId: "fc", toPort: "in" },
    { id: "e-fc-output", fromNodeId: "fc", fromPort: "out", toNodeId: "output", toPort: "in" },
  ],
}
