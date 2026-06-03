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
import { estimateNodeParamCount, formatParamCount } from "./core/graph/paramCount"
import type { GraphLayoutMode, NeuralGraph, ParamValue } from "./core/graph/types"
import { importModelSource, importOnnxBuffer } from "./core/import/importModel"
import { getLayerDef } from "./core/registry/layerRegistry"
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
  const nodeParamCounts = useMemo(
    () =>
      Object.fromEntries(graph.nodes.map((node) => [node.id, estimateNodeParamCount(node)])),
    [graph.nodes],
  )
  const totalParamCount = useMemo(
    () => graph.nodes.reduce((total, node) => total + estimateNodeParamCount(node), 0),
    [graph.nodes],
  )
  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          layoutMode,
          paramCount: nodeParamCounts[node.id] ?? 0,
          specs: inference.specsByNodeId[node.id] ?? { inputs: [], outputs: [] },
          issueLevel: issues.find((issue) => issue.nodeId === node.id)?.level,
        },
      })),
    [inference.specsByNodeId, issues, layoutMode, nodeParamCounts, nodes],
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
    const selectedNode = nodes.find((node) => node.id === selectedNodeId)
    const offset = layoutMode === "vertical" ? { x: 0, y: 200 } : { x: 260, y: 0 }
    const nextPosition = selectedNode
      ? { x: selectedNode.position.x + offset.x, y: selectedNode.position.y + offset.y }
      : undefined
    const newNode = buildCanvasNode(layerType, nodes.length, layoutMode, nextPosition)

    setNodes((current) => [...current, newNode])
    setSelectedNodeId(newNode.id)

    if (!selectedNode) {
      fitCanvasSoon()
      return
    }

    const sourceDef = getLayerDef(selectedNode.data.layerType)
    const targetDef = getLayerDef(layerType)

    if (sourceDef.outputs.length === 0 || targetDef.inputs.length === 0) {
      fitCanvasSoon()
      return
    }

    const outgoing = edges.filter((edge) => edge.source === selectedNode.id)
    const sourcePort = sourceDef.outputs[0].name
    const targetPort = targetDef.inputs[0].name

    if (outgoing.length === 1 && targetDef.outputs.length > 0) {
      const downstream = outgoing[0]
      const relayPort = targetDef.outputs[0].name

      setEdges((current) => [
        ...current.filter((edge) => edge.id !== downstream.id),
        {
          id: `e-${selectedNode.id}-${newNode.id}-${targetPort}`,
          source: selectedNode.id,
          sourceHandle: sourcePort,
          target: newNode.id,
          targetHandle: targetPort,
          animated: false,
        },
        {
          id: `e-${newNode.id}-${downstream.target}-${downstream.targetHandle ?? "in"}`,
          source: newNode.id,
          sourceHandle: relayPort,
          target: downstream.target,
          targetHandle: downstream.targetHandle ?? "in",
          animated: false,
        },
      ])
    } else {
      setEdges((current) => [
        ...current,
        {
          id: `e-${selectedNode.id}-${newNode.id}-${targetPort}`,
          source: selectedNode.id,
          sourceHandle: sourcePort,
          target: newNode.id,
          targetHandle: targetPort,
          animated: false,
        },
      ])
    }

    fitCanvasSoon()
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

  async function handleImportModelFile(file: File) {
    const lowerName = file.name.toLowerCase()

    if (lowerName.endsWith(".pt") || lowerName.endsWith(".pth") || lowerName.endsWith(".ckpt")) {
      window.alert("Checkpoint weights are not supported yet. Please import Graph JSON, PyTorch .py, ONNX, or a text model definition file.")
      return
    }

    try {
      const importedGraph =
        lowerName.endsWith(".onnx") || lowerName.endsWith(".pb")
          ? importOnnxBuffer(await file.arrayBuffer(), layoutMode)
          : importModelSource(await file.text(), layoutMode)
      loadGraph(importedGraph)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed."
      window.alert(message)
    }
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
          <p>支持 Transformer 编解码、LSTM/GRU、经典模型预设、模型文件导入、参数量统计，以及横向/竖向两种阅读模式。</p>
        </div>
        <div className="topbar__stats">
          <div className="stat-card">
            <span>Total Params</span>
            <strong>{formatParamCount(totalParamCount)}</strong>
          </div>
          <div className="stat-card">
            <span>Nodes</span>
            <strong>{nodes.length}</strong>
          </div>
          <div className="stat-card">
            <span>Issues</span>
            <strong>{issues.length}</strong>
          </div>
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

      <LayerPalette onAddLayer={handleAddLayer} selectedNodeName={selectedNode?.data.name} />

      <section className="workspace-grid">
        <div className="main-stack">
          <PresetLibrary presets={modelPresets} onLoadPreset={(preset) => loadGraph(preset.graph)} />
          <section className="canvas-panel">
            <div className="canvas-panel__header">
              <div>
                <h2>Graph Canvas</h2>
                <p>
                  Layout {layoutMode} · Nodes {nodes.length} · Edges {edges.length} · Issues {issues.length} · Params {formatParamCount(totalParamCount)}
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
        </div>

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
        onImportModelFile={handleImportModelFile}
        onCopyPyTorch={() => copyToClipboard(pythonCode)}
        onCopyJson={() => copyToClipboard(graphJson)}
      />
    </main>
  )
}
