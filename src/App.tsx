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
import {
  type Locale,
  formatExactParamCount,
  formatLayoutMode,
  getLayerDescription,
  getLayerLabel,
  getUiText,
  translateMessage,
} from "./i18n"
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

function getPreferredLocale(): Locale {
  if (typeof window === "undefined") {
    return "zh"
  }

  const stored = window.localStorage.getItem("nnmind-locale")
  if (stored === "zh" || stored === "en") {
    return stored
  }

  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"
}

function getStoredPanelState(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") {
    return fallback
  }

  const stored = window.localStorage.getItem(key)
  return stored === null ? fallback : stored === "true"
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(getPreferredLocale)
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>(defaultLayoutMode)
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodes[0]?.id ?? null)
  const [draftJson, setDraftJson] = useState("")
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<CanvasNode, Edge> | null>(null)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState<boolean>(() =>
    getStoredPanelState("nnmind-left-sidebar-collapsed", false),
  )
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState<boolean>(() =>
    getStoredPanelState("nnmind-right-sidebar-collapsed", false),
  )

  const text = getUiText(locale)

  useEffect(() => {
    window.localStorage.setItem("nnmind-locale", locale)
  }, [locale])

  useEffect(() => {
    window.localStorage.setItem("nnmind-left-sidebar-collapsed", String(leftSidebarCollapsed))
  }, [leftSidebarCollapsed])

  useEffect(() => {
    window.localStorage.setItem("nnmind-right-sidebar-collapsed", String(rightSidebarCollapsed))
  }, [rightSidebarCollapsed])

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
          label: getLayerLabel(node.data.layerType, node.data.label, locale),
          description: getLayerDescription(node.data.layerType, node.data.description, locale),
          layoutMode,
          locale,
          paramCount: nodeParamCounts[node.id] ?? 0,
          specs: inference.specsByNodeId[node.id] ?? { inputs: [], outputs: [] },
          issueLevel: issues.find((issue) => issue.nodeId === node.id)?.level,
        },
      })),
    [inference.specsByNodeId, issues, layoutMode, locale, nodeParamCounts, nodes],
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
      window.alert(text.unsupportedCheckpoint)
      return
    }

    try {
      const importedGraph =
        lowerName.endsWith(".onnx") || lowerName.endsWith(".pb")
          ? importOnnxBuffer(await file.arrayBuffer(), layoutMode)
          : importModelSource(await file.text(), layoutMode)
      loadGraph(importedGraph)
    } catch (error) {
      const message = error instanceof Error ? translateMessage(locale, error.message) : text.importFailed
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
        <div className="topbar__intro">
          <span className="topbar__eyebrow">{text.appEyebrow}</span>
          <h1>{text.appTitle}</h1>
          <p>{text.appDescription}</p>
        </div>
        <div className="topbar__stats">
          <div className="stat-card">
            <span>{text.totalParams}</span>
            <strong>{formatParamCount(totalParamCount)}</strong>
            <small>{formatExactParamCount(locale, totalParamCount)}</small>
          </div>
          <div className="stat-card">
            <span>{text.nodes}</span>
            <strong>{nodes.length}</strong>
          </div>
          <div className="stat-card">
            <span>{text.issues}</span>
            <strong>{issues.length}</strong>
          </div>
        </div>
        <div className="topbar__controls">
          <div className="locale-switch" role="group" aria-label={text.language}>
            <span className="locale-switch__label">{text.language}</span>
            <button
              type="button"
              className={locale === "zh" ? "is-active" : ""}
              onClick={() => setLocale("zh")}
            >
              {text.chinese}
            </button>
            <button
              type="button"
              className={locale === "en" ? "is-active" : ""}
              onClick={() => setLocale("en")}
            >
              {text.english}
            </button>
          </div>
          <div className="topbar__actions">
            <button type="button" onClick={() => loadGraph(defaultGraph)}>
              {text.resetSample}
            </button>
            <button type="button" onClick={handleToggleLayout}>
              {layoutMode === "horizontal" ? text.switchToVertical : text.switchToHorizontal}
            </button>
            <button type="button" onClick={() => copyToClipboard(graphJson)}>
              {text.copyGraphJson}
            </button>
            <button type="button" onClick={() => copyToClipboard(pythonCode)}>
              {text.copyPyTorch}
            </button>
          </div>
        </div>
      </header>

      <section className="workspace-shell">
        <aside className={`sidebar sidebar--left ${leftSidebarCollapsed ? "is-collapsed" : ""}`}>
          <div className="sidebar__header">
            <div>
              <span className="sidebar__eyebrow">{text.leftSidebar}</span>
              {!leftSidebarCollapsed ? <strong>{text.quickAddTitle}</strong> : null}
            </div>
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => {
                setLeftSidebarCollapsed((current) => !current)
                fitCanvasSoon()
              }}
            >
              {leftSidebarCollapsed ? text.expand : text.collapse}
            </button>
          </div>
          {leftSidebarCollapsed ? (
            <div className="sidebar__collapsed-copy">{text.leftSidebar}</div>
          ) : (
            <div className="sidebar__content">
              <LayerPalette locale={locale} onAddLayer={handleAddLayer} selectedNodeName={selectedNode?.data.name} />
              <PresetLibrary locale={locale} presets={modelPresets} onLoadPreset={(preset) => loadGraph(preset.graph)} />
            </div>
          )}
        </aside>

        <div className="center-stack">
          <section className="canvas-panel">
            <div className="canvas-panel__header">
              <div>
                <h2>{text.canvasTitle}</h2>
                <p>
                  {text.layout} {formatLayoutMode(locale, layoutMode)} · {text.nodes} {nodes.length} · {text.edges} {edges.length} · {text.issues} {issues.length} · {text.params} {formatParamCount(totalParamCount)}
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

          <ExportPanel
            locale={locale}
            graphJson={graphJson}
            pythonCode={pythonCode}
            draftJson={draftJson}
            onDraftJsonChange={setDraftJson}
            onImportJson={() => {
              try {
                loadGraphFromJson(draftJson)
              } catch (error) {
                const message = error instanceof Error ? translateMessage(locale, error.message) : text.importFailed
                window.alert(message)
              }
            }}
            onImportModelFile={handleImportModelFile}
            onCopyPyTorch={() => copyToClipboard(pythonCode)}
            onCopyJson={() => copyToClipboard(graphJson)}
          />
        </div>

        <aside className={`sidebar sidebar--right ${rightSidebarCollapsed ? "is-collapsed" : ""}`}>
          <div className="sidebar__header">
            <div>
              <span className="sidebar__eyebrow">{text.rightSidebar}</span>
              {!rightSidebarCollapsed ? <strong>{text.inspectorTitle}</strong> : null}
            </div>
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => {
                setRightSidebarCollapsed((current) => !current)
                fitCanvasSoon()
              }}
            >
              {rightSidebarCollapsed ? text.expand : text.collapse}
            </button>
          </div>
          {rightSidebarCollapsed ? (
            <div className="sidebar__collapsed-copy">{text.rightSidebar}</div>
          ) : (
            <div className="sidebar__content side-stack">
              <Inspector locale={locale} node={selectedNode} onUpdateName={handleUpdateName} onUpdateParam={handleUpdateParam} />
              <IssuesPanel locale={locale} issues={issues} />
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}
