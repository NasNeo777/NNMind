# NNMind

**Visual Neural Graph Editor for PyTorch**

NNMind is a drag-and-drop neural network editor built on React Flow. Assemble CNN, RNN, and Transformer architectures on a canvas, inspect per-node parameter counts and tensor shapes in real time, validate graph structure, and export to PyTorch code or Graph JSON — all in the browser.

[中文说明](#中文说明)

---

## Features

### Graph Canvas
- **Drag-and-drop React Flow canvas** — add, connect, and rearrange layer nodes freely
- **Collapsible sidebars** — left (Quick Add + Model Presets) and right (Inspector + Validator) toolbars can be collapsed to reclaim canvas space
- **Fullscreen mode** — expand the canvas to fill the entire viewport for focused editing
- **Horizontal / vertical layout** — switch between left-to-right and top-to-bottom reading modes with one click
- **Connection menu** — drag a handle into empty space to search and insert a new layer inline

### Layer Support (30+ types)
| Category | Layers |
|---|---|
| Input / Output | `Input`, `Output` |
| Convolution | `Conv2d` |
| Residual | `ResidualBlock2d`, `ResNetBasicBlock`, `ResNetBottleneck` |
| Normalization | `BatchNorm2d`, `LayerNorm` |
| Activation | `ReLU`, `GELU` |
| Pooling | `MaxPool2d`, `AdaptiveAvgPool2d` |
| Transformer | `SelfAttention`, `TransformerEncoder`, `TransformerDecoder`, `PatchEmbedding`, `TokenPool` |
| Sequence | `LSTM`, `GRU` |
| Embedding | `Embedding` |
| Linear | `Linear`, `Flatten`, `Dropout` |
| Merge | `Add`, `Concat` |

### Inspection & Validation
- **Per-node parameter count** — each node displays an abbreviated param count on the canvas; the inspector shows exact values
- **Total parameter count** — live aggregation in the top bar
- **Tensor shape inference** — propagates shapes through the graph and displays input/output specs per node
- **Graph validator** — detects missing inputs/outputs, cycles, isolated nodes, port mismatches, and shape errors

### Import & Export
- **Graph JSON** — full round-trip: export → edit → re-import
- **PyTorch code generation** — produces clean `torch.nn` module code
- **ONNX import** — load `.onnx` / `.pb` model files
- **Text model import** — parse PyTorch `.py` / `.txt` model definitions

### Quality of Life
- **Chinese / English UI** — switch language in the top bar; locale persists across sessions
- **7 built-in model presets** — one-click load classic architectures (ResNet, VGG, ViT, LSTM, Transformer)
- **Sidebar state persistence** — collapse/expand preferences are remembered

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build → dist/
npm run preview  # preview production build
npm run lint     # ESLint
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Top Bar: stats · language switch · layout toggle ·     │
│           copy JSON/PyTorch · reset sample              │
├──────────┬────────────────────────────┬─────────────────┤
│ Left     │                            │ Right           │
│ Sidebar  │      Graph Canvas          │ Sidebar         │
│          │                            │                 │
│ • Quick  │   ┌───┐   ┌────┐  ┌────┐  │ • Inspector     │
│   Add    │   │In │──▶│Cnv │─▶│Out │  │   (params,      │
│          │   └───┘   └────┘  └────┘  │    shapes)      │
│ • Model  │                            │ • Validator     │
│   Presets│   [Fullscreen toggle]      │   (warnings,    │
│          │                            │    errors)      │
│ (both    ├────────────────────────────┤                 │
│  collap- │  Export & Import panel     │  (collapsible)  │
│  sible)  │                            │                 │
└──────────┴────────────────────────────┴─────────────────┘
```

---

## Built-in Presets

| Preset | Description |
|---|---|
| **Simple CNN** | A blank canvas with a single Input node — start from scratch |
| **ResNet-18** | 18-layer residual network (BasicBlock) |
| **ResNet-50** | 50-layer deep residual network (Bottleneck) |
| **VGG-16** | Classic VGG conv-pool stack with classifier head |
| **LSTM Classifier** | Bidirectional LSTM for text / time-series classification |
| **Transformer Seq2Seq** | Dual-input encoder-decoder Transformer |
| **DINOv3-style ViT** | Modern vision backbone with PatchEmbedding + TransformerEncoder |

---

## Project Structure

```
src/
  core/
    codegen/      generatePyTorch.ts   — nn.Module code generation
    graph/        types.ts             — NeuralGraph, LayerNode, Edge types
                  paramCount.ts        — per-node & total parameter counting
    import/       importModel.ts       — ONNX / text model definition parser
    registry/     layerRegistry.ts     — layer definitions & default params
    serialize/    graphJson.ts         — JSON serialization / deserialization
    shape/        inferShape.ts        — forward shape propagation
    validate/     validateGraph.ts     — structural rule checks
  editor/
    LayerNode.tsx        — custom React Flow node component
    LayerPalette.tsx     — Quick Add layer picker
    PresetLibrary.tsx    — model preset cards
    Inspector.tsx        — selected-node parameter editor
    IssuesPanel.tsx      — validator results panel
    ExportPanel.tsx      — import/export controls
    graphAdapter.ts      — NeuralGraph ↔ React Flow conversion
    layout.ts            — horizontal / vertical layout engine
  examples/
    modelPresets.ts      — 7 preset architectures
    simpleCnn.ts         — default blank-canvas graph
  i18n.ts                — Chinese / English translations
  App.tsx                — main app shell
  App.css                — global styles
```

---

## Roadmap

- Stricter port-type compatibility checks
- Delete node / delete edge / undo / redo
- Multi-branch codegen for `Add` / `Concat` fusion nodes
- FLOPs estimation
- Local persistence (IndexedDB) and `.json` file download
- Node search / filter across large graphs

---

## Tech Stack

| Layer | Choice |
|---|---|
| Canvas | [React Flow](https://reactflow.dev) (`@xyflow/react`) |
| Framework | React 19 + TypeScript |
| Build | Vite |
| Codegen | Template-based PyTorch `nn.Module` emitter |
| ONNX | `onnx-proto` for `.onnx` / `.pb` parsing |
| Styling | Plain CSS with CSS custom properties |

---

## License

MIT

---

## 中文说明

NNMind 是一个基于 React Flow 的可视化神经网络编辑器，面向 PyTorch 工作流。你可以在画布上拖拽搭建 CNN、RNN、Transformer 等网络骨架，实时查看每层参数量与张量 shape，校验图结构，并导出 Graph JSON 或 PyTorch 代码。

### 主要功能

**画布操作**
- 可拖拽、可连线的 React Flow 画布
- 左右工具栏可收起，节约画布空间
- **画布全屏模式** — 一键将画布扩展至整个视口，专注编辑
- 横向 / 纵向两种阅读布局，一键切换
- 从节点端口拖拽到空白处弹出搜索菜单，快速插入中间层

**内置图层（30+ 种）**
- 输入输出、卷积、残差块、归一化、激活函数、池化
- Transformer（自注意力、编码器、解码器、PatchEmbedding、TokenPool）
- 序列模型（LSTM、GRU）、嵌入、全连接、合并（Add / Concat）

**检查与校验**
- 每个节点上显示参数量（缩写值），检查器中显示精确值
- 顶部栏实时汇总总参数量
- 张量 shape 前向推导，每节点显示输入 / 输出规格
- 图结构校验器：检测缺失输入/输出、环路、孤立节点、端口与 shape 错误

**导入与导出**
- Graph JSON 完整往返：导出 → 编辑 → 重新导入
- PyTorch 代码生成（`torch.nn.Module`）
- ONNX 模型导入（`.onnx` / `.pb`）
- 文本模型定义导入（`.py` / `.txt`）

**体验细节**
- 中英文界面切换，语言偏好自动持久化
- 7 个内置模型预设，一键载入经典架构
- 侧栏收起/展开状态自动记忆

### 快速启动

```bash
npm install
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173)。

```bash
npm run build    # 生产构建 → dist/
npm run preview  # 预览生产构建
```

### 界面布局

- **顶部栏**：参数量统计、语言切换、布局切换、复制 JSON/PyTorch、重置样例
- **左侧工具栏**：Quick Add 图层库 + Model Presets 预设库（可收起）
- **中央画布**：主编辑区 + 全屏切换按钮 + 导入导出面板
- **右侧工具栏**：节点检查器 + 校验结果（可收起）

### 内置预设

| 预设 | 说明 |
|---|---|
| Simple CNN | 单输入节点的空白画布，自由搭建 |
| ResNet-18 | BasicBlock 组成的 18 层残差网络 |
| ResNet-50 | Bottleneck 组成的 50 层深度残差网络 |
| VGG-16 | 经典卷积-池化堆叠 + 分类头 |
| LSTM Classifier | 双向 LSTM 文本/时序分类链路 |
| Transformer Seq2Seq | 双输入编解码 Transformer |
| DINOv3-style ViT | PatchEmbedding + TransformerEncoder 现代视觉骨架 |

### 项目结构

```
src/
  core/
    codegen/       PyTorch nn.Module 代码生成
    graph/         图类型定义与参数量统计
    import/        ONNX / 文本模型导入
    registry/      图层定义与默认参数
    serialize/     Graph JSON 序列化
    shape/         shape 前向推导
    validate/      图结构校验
  editor/          画布、侧栏、检查器等 UI 组件
  examples/        预设模型
  i18n.ts          中英文翻译
```

### 后续计划

- 更严格的端口类型校验
- 删除节点 / 删除边 / 撤销重做
- Add / Concat 多分支代码导出
- FLOPs 估算
- 本地持久化与文件下载
- 大规模图中的节点搜索/过滤

### 技术栈

| 层级 | 选型 |
|---|---|
| 画布 | React Flow (`@xyflow/react`) |
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 代码生成 | 模板驱动的 PyTorch nn.Module 生成 |
| ONNX | `onnx-proto` 解析 |
| 样式 | 纯 CSS + CSS 自定义属性 |

### 开源协议

MIT