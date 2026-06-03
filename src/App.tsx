import { useEffect, useMemo, useState, startTransition } from "react"
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
} from "@xyflow/react"
import { generatePyTorch } from "./core/codegen/generatePyTorch"
import type { GraphIssue, ParamValue } from "./core/graph/types"
import { serializeGraph, parseGraphJson } from "./core/serialize/graphJson"
import { validateGraph } from "./core/validate/validateGraph"
import { simpleCnnGraph } from "./examples/simpleCnn"
import { ExportPanel } from "./editor/ExportPanel"
import { canvasToGraph, buildCanvasNode, graphToCanvasEdges, graphToCanvasNodes } from "./editor/graphAdapter"
import { Inspector } from "./editor/Inspector"
import { IssuesPanel } from "./editor/IssuesPanel"
import { LayerNode } from "./editor/LayerNode"
import { LayerPalette } from "./editor/LayerPalette"
import type { CanvasNode } from "./editor/types"
import "./App.css"

const nodeTypes: NodeTypes = {
  layerNode: LayerNode,
}

const initialNodes = graphToCanvasNodes(simpleCnnGraph)
const initialEdges = graphToCanvasEdges(simpleCnnGraph)

function copyToClipboard(value: string) {
  void navigator.clipboard.writeText(value)
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodes[0]?.id ?? null)
  const [draftJson, setDraftJson] = useState("")

  const graph = useMemo(() => canvasToGraph(nodes, edges), [edges, nodes])
  const issues = useMemo(() => validateGraph(graph), [graph])
  const inference = useMemo(() => {
    const shapeMap = new Map<string, CanvasNode["data"]["specs"]>()

    for (const issue of issues) {
      if (issue.nodeId && !shapeMap.has(issue.nodeId)) {
        shapeMap.set(issue.nodeId, { inputs: [], outputs: [] })
      }
    }

    const inferred = graph.nodes.reduce<Record<string, CanvasNode["data"]["specs"]>>((accumulator, node) => {
      const incoming = issues
      void incoming
      return accumulator
    }, {})

    void inferred
    return graph
  }, [graph, issues])

  useEffect(() => {
    const graphNow = canvasToGraph(nodes, edges)
    const validation = validateGraph(graphNow)
    const nextNodes = graphToCanvasNodes(graphNow)

    setNodes((previous) =>
      previous.map((node) => {
        const match = nextNodes.find((item) => item.id === node.id)
        const issueLevel = validation.find((issue) => issue.nodeId === node.id)?.level

        return match
          ? {
              ...node,
              data: {
                ...node.data,
                ...match.data,
                specs: undefined,
                issueLevel,
              },
            }
          : node
      }),
    )
  }, [edges, nodes, setNodes])

  const graphJson = useMemo(() => serializeGraph(graph), [graph])
  const pythonCode = useMemo(() => generatePyTorch(graph), [graph])
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  function refreshNodeDecorations() {
    const graphNow = canvasToGraph(nodes, edges)
    const shapeInference = (() => {
      const module = require("./core/shape/inferShape")
      return module.inferGraph(graphNow) as {
        specsByNodeId: Record<string, { inputs: any[]; outputs: any[] }>
      }
    })()
    const validation = validateGraph(graphNow)

    setNodes((previous) =>
      previous.map((node) => ({
        ...node,
        data: {
          ...node.data,
          specs: shapeInference.specsByNodeId[node.id] ?? { inputs: [], outputs: [] },
          issueLevel: validation.find((issue) => issue.nodeId === node.id)?.level,
        },
      })),
    )
  }

  useEffect(() => {
    refreshNodeDecorations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setNodes((current) => [...current, buildCanvasNode(layerType, current.length)])
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

    startTransition(() => {
      setNodes(graphToCanvasNodes(parsed))
      setEdges(graphToCanvasEdges(parsed))
      setSelectedNodeId(parsed.nodes[0]?.id ?? null)
    })
  }

  useEffect(() => {
    refreshNodeDecorations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length, graphJson])

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="topbar__eyebrow">NNMind MVP</span>
          <h1>Visual Neural Graph Editor</h1>
          <p>拖节点、连线、改参数、看 shape、导出 PyTorch。先把 2D 主链路做实。</p>
        </div>
        <div className="topbar__actions">
          <button type="button" onClick={() => loadGraphFromJson(serializeGraph(simpleCnnGraph))}>
            Reset Sample
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
        <LayerPalette onAddLayer={handleAddLayer} />

        <section className="canvas-panel">
          <div className="canvas-panel__header">
            <div>
              <h2>Graph Canvas</h2>
              <p>
                Nodes {nodes.length} · Edges {edges.length} · Issues {issues.length}
              </p>
            </div>
          </div>
          <div className="flow-surface">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
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
