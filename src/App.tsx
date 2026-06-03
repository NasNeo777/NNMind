import { useMemo, useState, startTransition } from "react"
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react"
import { generatePyTorch } from "./core/codegen/generatePyTorch"
import type { GraphLayoutMode, NeuralGraph, ParamValue } from "./core/graph/types"
import { serializeGraph, parseGraphJson } from "./core/serialize/graphJson"
import { inferGraph } from "./core/shape/inferShape"
import { validateGraph } from "./core/validate/validateGraph"
import { modelPresets } from "./examples/modelPresets"
import { ExportPanel } from "./editor/ExportPanel"
import { canvasToGraph, buildCanvasNode, graphToCanvasEdges, graphToCanvasNodes } from "./editor/graphAdapter"
import { Inspector } from "./editor/Inspector"
import { IssuesPanel } from "./editor/IssuesPanel"
import { applyLayoutModeToNodes } from "./editor/layout"
import { LayerNode } from "./editor/LayerNode"
import { LayerPalette } from "./editor/LayerPalette"
import { PresetLibrary } from "./editor/PresetLibrary"
import type { CanvasNode } from "./editor/types"
import "./App.css"

const nodeTypes = {
  layerNode: LayerNode,
} satisfies NodeTypes

const defaultLayoutMode: GraphLayoutMode = "horizontal"
const defaultGraph = modelPresets[0].graph
const initialNodes = graphToCanvasNodes(defaultGraph, defaultLayoutMode)
const initialEdges = graphToCanvasEdges(defaultGraph)

function copyToClipboard(value: string) {
  void navigator.clipboard.writeText(value)
}

export default function App() {
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>(defaultLayoutMode)
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodes[0]?.id ?? null)
  const [draftJson, setDraftJson] = useState("")
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<CanvasNode, Edge> | null>(null)

  const graph = useMemo(() => canvasToGraph(nodes, edges), [edges, nodes])
  const inference = useMemo(() => inferGraph(graph), [graph])
  const issues = useMemo(() => validateGraph(graph), [graph])
  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          layoutMode,
          specs: inference.specsByNodeId[node.id] ?? { inputs: [], outputs: [] },
          issueLevel: issues.find((issue) => issue.nodeId === node.id)?.level,
        },
      })),
    [inference.specsByNodeId, issues, layoutMode, nodes],
  )

  const graphJson = useMemo(() => serializeGraph(graph), [graph])
  const pythonCode = useMemo(() => generatePyTorch(graph), [graph])
  const selectedNode = decoratedNodes.find((node) => node.id === selectedNodeId)

  function fitCanvasSoon() {
    requestAnimationFrame(() => {
      flowInstance?.fitView({ padding: 0.2, duration: 300 })
    })
  }

  function loadGraph(nextGraph: NeuralGraph, nextLayoutMode = layoutMode) {
    startTransition(() => {
      setNodes(graphToCanvasNodes(nextGraph, nextLayoutMode))
      setEdges(graphToCanvasEdges(nextGraph))
      setSelectedNodeId(nextGraph.nodes[0]?.id ?? null)
    })
    fitCanvasSoon()
  }

  function handleConnect(connection: Connection) {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          animated: false,
        },
        current,
      ),
    )
  }

  function handleAddLayer(layerType: CanvasNode["data"]["layerType"]) {
    setNodes((current) => [...current, buildCanvasNode(layerType, current.length, layoutMode)])
  }

  function handleUpdateName(name: string) {
    if (!selectedNodeId) {
      return
    }

    setNodes((current) =>
      current.map((node) => (node.id === selectedNodeId ? { ...node, data: { ...node.data, name } } : node)),
    )
  }

  function handleUpdateParam(paramName: string, value: ParamValue) {
    if (!selectedNodeId) {
      return
    }

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                params: {
                  ...node.data.params,
                  [paramName]: value,
                },
              },
            }
          : node,
      ),
    )
  }

  function loadGraphFromJson(raw: string) {
    const parsed = parseGraphJson(raw)
    loadGraph(parsed)
  }

  function handleToggleLayout() {
    const nextLayoutMode: GraphLayoutMode = layoutMode === "horizontal" ? "vertical" : "horizontal"
    setLayoutMode(nextLayoutMode)
    setNodes((current) => applyLayoutModeToNodes(current, nextLayoutMode))
    fitCanvasSoon()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="topbar__eyebrow">NNMind Extended</span>
          <h1>Visual Neural Graph Editor</h1>
          <p>现在已经支持 Transformer 编解码、LSTM/GRU、经典模型预设，以及横向/竖向两种阅读模式。</p>
        </div>
        <div className="topbar__actions">
          <button type="button" onClick={() => loadGraph(defaultGraph)}>
            Reset Sample
          </button>
          <button type="button" onClick={handleToggleLayout}>
            {layoutMode === "horizontal" ? "Switch To Vertical" : "Switch To Horizontal"}
          </button>
          <button type="button" onClick={() => copyToClipboard(graphJson)}>
            Copy Graph JSON
          </button>
          <button type="button" onClick={() => copyToClipboard(pythonCode)}>
            Copy PyTorch
          </button>
        </div>
      </header>

      <section className="workspace-grid">
        <div className="left-stack">
          <PresetLibrary presets={modelPresets} onLoadPreset={(preset) => loadGraph(preset.graph)} />
          <LayerPalette onAddLayer={handleAddLayer} />
        </div>

        <section className="canvas-panel">
          <div className="canvas-panel__header">
            <div>
              <h2>Graph Canvas</h2>
              <p>
                Layout {layoutMode} · Nodes {nodes.length} · Edges {edges.length} · Issues {issues.length}
              </p>
            </div>
          </div>
          <div className="flow-surface">
            <ReactFlow
              nodes={decoratedNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
              onInit={setFlowInstance}
              fitView
              nodeTypes={nodeTypes}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={24} size={1} color="#cbd5e1" />
              <Controls />
              <MiniMap pannable zoomable />
            </ReactFlow>
          </div>
        </section>

        <div className="side-stack">
          <Inspector node={selectedNode} onUpdateName={handleUpdateName} onUpdateParam={handleUpdateParam} />
          <IssuesPanel issues={issues} />
        </div>
      </section>

      <ExportPanel
        graphJson={graphJson}
        pythonCode={pythonCode}
        draftJson={draftJson}
        onDraftJsonChange={setDraftJson}
        onImportJson={() => {
          try {
            loadGraphFromJson(draftJson)
          } catch (error) {
            const message = error instanceof Error ? error.message : "导入失败。"
            window.alert(message)
          }
        }}
        onCopyPyTorch={() => copyToClipboard(pythonCode)}
        onCopyJson={() => copyToClipboard(graphJson)}
      />
    </main>
  )
}
