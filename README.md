<div align="center">

<img src="https://img.shields.io/badge/NNMind-v0.1.0-2563eb?style=for-the-badge&logo=react&logoColor=white" alt="version" />
<img src="https://img.shields.io/badge/react-19-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="react" />
<img src="https://img.shields.io/badge/typescript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
<img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge&logo=bookstack&logoColor=white" alt="license" />

<br /><br />

<h1>🧠 NNMind</h1>

<h3><em>Visual Neural Graph Editor for PyTorch</em></h3>

<p>
  Drag. Connect. Inspect. Export.<br />
  Build neural network architectures on an infinite canvas —
  from a single <code>Input</code> node to a full ResNet or Transformer.
</p>

<br />

<p>
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#ui-layout">Layout</a> ·
  <a href="#presets">Presets</a> ·
  <a href="#structure">Structure</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="README_CN.md">中文文档</a>
</p>

</div>

<br />

---

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 Canvas
- **Drag-and-drop** React Flow canvas with custom layer nodes
- **Fullscreen mode** — expand the canvas edge-to-edge for focused editing
- **Collapsible sidebars** — reclaim screen space when you need it
- **Horizontal ↔ Vertical** layout toggle in one click
- **Inline connection menu** — drag a handle into empty space, search, and insert a new layer instantly

</td>
<td width="50%">

### 🔬 Inspection
- **Per-node parameter count** — abbreviated on canvas, exact in inspector
- **Live total parameter count** — updated in real time as you edit
- **Tensor shape propagation** — forward inference across the graph, shown per node
- **Graph validator** — catches missing I/O, cycles, isolated nodes, port mismatches, and shape errors

</td>
</tr>
</table>

### 🧱 30+ Built-in Layer Types

<div align="center">

| Category | Layers |
|:--|:--|
| **I/O** | `Input` · `Output` |
| **Convolution** | `Conv2d` |
| **Residual** | `ResidualBlock2d` · `ResNetBasicBlock` · `ResNetBottleneck` |
| **Normalization** | `BatchNorm2d` · `LayerNorm` |
| **Activation** | `ReLU` · `GELU` |
| **Pooling** | `MaxPool2d` · `AdaptiveAvgPool2d` |
| **Transformer** | `SelfAttention` · `TransformerEncoder` · `TransformerDecoder` · `PatchEmbedding` · `TokenPool` |
| **Sequence** | `LSTM` · `GRU` |
| **Embedding** | `Embedding` |
| **Linear** | `Linear` · `Flatten` · `Dropout` |
| **Merge** | `Add` · `Concat` |

</div>

### 📦 Import & Export

<table>
<tr>
<td width="25%" align="center"><strong>📄 Graph JSON</strong><br /><small>Full round-trip</small></td>
<td width="25%" align="center"><strong>🔥 PyTorch</strong><br /><small>nn.Module codegen</small></td>
<td width="25%" align="center"><strong>🧩 ONNX</strong><br /><small>.onnx / .pb import</small></td>
<td width="25%" align="center"><strong>📝 Text</strong><br /><small>.py / .txt import</small></td>
</tr>
</table>

### 🌐 Quality of Life

- **🇨🇳 🇺🇸 Chinese / English UI** — language switch with persistent preference
- **💾 Sidebar state** — collapse/expand settings remembered across sessions
- **📋 One-click copy** — Graph JSON and PyTorch code to clipboard
- **⚡ 7 presets** — load classic architectures instantly

<br />

---

<br />

## 🚀 <a id="quick-start"></a>Quick Start

<div align="center">

```bash
git clone https://github.com/NasNeo/NNMind.git
cd NNMind
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

</div>

<br />

| Command | Description |
|:--|:--|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check & production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

<br />

---

<br />

## 🖥️ <a id="ui-layout"></a>UI Layout

<pre align="center" style="background:#0f172a;color:#e2e8f0;padding:1.5rem;border-radius:16px;font-size:0.82rem;line-height:1.6;overflow-x:auto;">
┌──────────────────────────────────────────────────────────────────┐
│  <b style="color:#60a5fa">TOPBAR</b>                                                            │
│  Total Params · Nodes · Issues                                     │
│  Language Switch · Layout Toggle · Copy JSON/PyTorch · Reset       │
├───────────────┬──────────────────────────────┬────────────────────┤
│ <b style="color:#34d399">LEFT SIDEBAR</b>  │                              │ <b style="color:#f472b6">RIGHT SIDEBAR</b>      │
│  (collapsible)│                              │  (collapsible)     │
│               │       <b style="color:#fbbf24">GRAPH CANVAS</b>           │                    │
│  Quick Add    │                              │  Inspector         │
│  ┌──────────┐ │   ┌────┐   ┌──────┐  ┌────┐ │  · name            │
│  │ Conv2d   │ │   │    │   │      │  │    │ │  · params          │
│  │ ReLU     │ │   │ In │──▶│ Conv │─▶│Out │ │  · shapes          │
│  │ Linear   │ │   │    │   │      │  │    │ │                    │
│  │ ...      │ │   └────┘   └──────┘  └────┘ │  Validator         │
│  └──────────┘ │                              │  · errors          │
│               │   <b style="color:#94a3b8">[⛶ Fullscreen]</b>             │  · warnings        │
│  Model        │                              │                    │
│  Presets      ├──────────────────────────────┤                    │
│  ┌──────────┐ │                              │                    │
│  │ ResNet-18│ │  Export & Import Panel       │                    │
│  │ VGG-16   │ │  · Copy JSON / PyTorch       │                    │
│  │ ViT      │ │  · Load Draft JSON           │                    │
│  │ ...      │ │  · Import Model File         │                    │
│  └──────────┘ │                              │                    │
└───────────────┴──────────────────────────────┴────────────────────┘
</pre>

<br />

---

<br />

## 🎯 <a id="presets"></a>Built-in Presets

<div align="center">

| Preset | Architecture | Description |
|:--|:--|:--|
| 🟦 **Simple CNN** | `Input` only | Blank canvas — build from scratch |
| 🟩 **ResNet-18** | BasicBlock × 8 | Classic 18-layer residual network |
| 🟩 **ResNet-50** | Bottleneck × 16 | Deep 50-layer residual backbone |
| 🟨 **VGG-16** | 13×Conv + 3×FC | Conv-pool stack with classifier head |
| 🟪 **LSTM Classifier** | BiLSTM → Linear | Text / time-series classification |
| 🟧 **Transformer Seq2Seq** | Encoder + Decoder | Dual-input seq2seq with cross-attention |
| 🟥 **DINOv3-style ViT** | PatchEmbed + Encoder | Modern vision transformer backbone |

</div>

<br />

---

<br />

## 📁 <a id="structure"></a>Project Structure

<pre style="background:#0f172a;color:#e2e8f0;padding:1.2rem;border-radius:12px;font-size:0.84rem;line-height:1.7;overflow-x:auto;">
<b style="color:#60a5fa">src/</b>
├── <b style="color:#60a5fa">core/</b>
│   ├── codegen/          <b style="color:#94a3b8">PyTorch nn.Module code generation</b>
│   ├── graph/            <b style="color:#94a3b8">NeuralGraph types · parameter counting</b>
│   ├── import/           <b style="color:#94a3b8">ONNX / text model definition parser</b>
│   ├── registry/         <b style="color:#94a3b8">Layer definitions &amp; default params</b>
│   ├── serialize/        <b style="color:#94a3b8">Graph JSON serialization</b>
│   ├── shape/            <b style="color:#94a3b8">Forward tensor shape inference</b>
│   └── validate/         <b style="color:#94a3b8">Graph structural validation</b>
├── <b style="color:#60a5fa">editor/</b>              <b style="color:#94a3b8">Canvas, sidebars, inspector, export UI</b>
├── <b style="color:#60a5fa">examples/</b>           <b style="color:#94a3b8">7 model presets + default graph</b>
├── i18n.ts               <b style="color:#94a3b8">Chinese / English translations</b>
├── App.tsx               <b style="color:#94a3b8">Main application shell</b>
└── App.css               <b style="color:#94a3b8">Global styles with CSS custom properties</b>
</pre>

<br />

---

<br />

## 🗺️ <a id="roadmap"></a>Roadmap

<table>
<tr>
<td width="33%">

### 🔜 Short Term
- Stricter port-type validation
- Delete node / delete edge
- Undo / redo

</td>
<td width="33%">

### 📋 Medium Term
- Multi-branch codegen for `Add` / `Concat`
- FLOPs estimation
- Node search & filter

</td>
<td width="33%">

### 🌟 Long Term
- IndexedDB persistence
- `.json` / `.py` file download
- Training config export
- TensorBoard graph export

</td>
</tr>
</table>

<br />

---

<br />

## 🛠️ Tech Stack

<div align="center">

| Layer | Choice |
|:--|:--|
| **Canvas** | [React Flow](https://reactflow.dev) (`@xyflow/react`) |
| **UI Framework** | React 19 + TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Code Generation** | Template-based PyTorch `nn.Module` emitter |
| **ONNX Parsing** | `onnx-proto` |
| **Styling** | Plain CSS + custom properties |

</div>

<br />

---

<div align="center">

<br />

## 📄 License

**[MIT](LICENSE)** © 2026 NasNeo

<br />

<p>
  <a href="README_CN.md">📖 中文文档</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/NasNeo/NNMind">⭐ Star on GitHub</a>
</p>

<br />

<img src="https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F%20and%20coffee-fbbf24?style=flat-square" alt="made with love" />

</div>