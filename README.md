<div align="center">

<img src="https://img.shields.io/badge/NNMind-v0.1.0-2563eb?style=for-the-badge&logo=react&logoColor=white" alt="version" />
<img src="https://img.shields.io/badge/react-19-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="react" />
<img src="https://img.shields.io/badge/typescript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
<img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge&logo=bookstack&logoColor=white" alt="license" />
<a href="https://github.com/NasNeo/NNMind"><img src="https://img.shields.io/github/stars/NasNeo/NNMind?style=for-the-badge&logo=github&color=fbbf24" alt="stars" /></a>

<br /><br />

<h1>🧠 NNMind</h1>

<h2><em>Open Source Visual Neural Network Designer &amp; PyTorch Model Builder</em></h2>

<p>
  <strong>Drag. Connect. Inspect. Export.</strong><br />
  A <strong>no-code deep learning architecture editor</strong> for researchers, engineers, and students.<br />
  Design CNN, RNN, LSTM, GRU, and Transformer models on an <strong>interactive graph canvas</strong> —<br />
  from a single <code>Input</code> node to production-grade architectures like ResNet, VGG, or ViT.
</p>

<br />

<table>
<tr>
<td align="center">🎨<br /><strong>Visual Graph Editor</strong><br />Drag &amp; drop neural network design</td>
<td align="center">🔬<br /><strong>Live Shape Inference</strong><br />Real-time tensor dimension tracking</td>
<td align="center">📊<br /><strong>Parameter Counting</strong><br />Per-node &amp; total FLOPs-ready stats</td>
<td align="center">🔥<br /><strong>PyTorch Codegen</strong><br />Export to nn.Module instantly</td>
</tr>
</table>

<br />

<p>
  <a href="#-why-nnmind">Why NNMind</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-ui-layout">Layout</a> ·
  <a href="#-presets">Presets</a> ·
  <a href="#-project-structure">Structure</a> ·
  <a href="#-roadmap">Roadmap</a> ·
  <a href="README_CN.md">中文文档</a>
</p>

</div>

<br />

---

<br />

## 💡 <a id="-why-nnmind"></a>Why NNMind?

> **Stop writing boilerplate. Start seeing your model.**

Whether you're **prototyping a novel architecture**, **teaching deep learning concepts**, or **reverse-engineering an ONNX model** — NNMind gives you an **intuitive visual interface** that replaces hundreds of lines of tedious `nn.Module` wiring with a **drag-and-drop canvas**.

<table>
<tr>
<td width="33%">

### 🎓 For Educators & Students
Visualize **forward propagation**, inspect **tensor shapes** at every layer, and understand **parameter distribution** — all interactively. Perfect for **deep learning courses**, **workshops**, and **self-study**.

</td>
<td width="33%">

### 🔬 For Researchers
Rapidly **sketch novel architectures**, validate **shape compatibility** before writing code, and export **clean PyTorch** ready for training. Ideal for **paper prototyping** and **ablation studies**.

</td>
<td width="33%">

### 🏭 For Engineers
Import **ONNX models** to visualize existing architectures, debug **shape mismatches** with the built-in validator, and generate **production-ready nn.Module code**. Great for **model review** and **onboarding**.

</td>
</tr>
</table>

<br />

---

<br />

## 🚀 <a id="-quick-start"></a>Quick Start

```bash
git clone https://github.com/NasNeo/NNMind.git
cd NNMind
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** — you'll see a canvas with a single Input node. Start building.

<br />

| Command | Description |
|:--|:--|
| `npm run dev` | Start dev server with hot module replacement |
| `npm run build` | Type-check & production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

<br />

---

<br />

## ✨ <a id="-features"></a>Features

<table>
<tr>
<td width="50%">

### 🎨 Interactive Graph Canvas
- **Drag-and-drop layer nodes** on an infinite React Flow canvas
- **Fullscreen mode** — expand edge-to-edge for immersive model design
- **Collapsible sidebars** — reclaim screen real estate when you need focus
- **Horizontal ↔ Vertical layout** — switch reading direction in one click
- **Inline connection menu** — drag from a port, search layers, insert mid-pipeline instantly
- **Custom node rendering** — each layer type has its own visual identity with color coding

</td>
<td width="50%">

### 🔬 Real-Time Model Inspection
- **Per-node parameter count** — abbreviated on canvas, exact value in the inspector panel
- **Live total parameter aggregation** — updates instantly as you add, edit, or reconnect nodes
- **Forward tensor shape propagation** — input/output dimensions computed and displayed for every node
- **Graph structure validator** — detects missing inputs/outputs, circular dependencies, isolated nodes, port mismatches, and shape incompatibilities
- **Issue severity levels** — errors, warnings, and info hints with localized messages

</td>
</tr>
</table>

### 🧱 30+ Built-in Layer Types — Batteries Included

<div align="center">

| Category | Layers |
|:--|:--|
| **I/O** | `Input` · `Output` |
| **Convolution** | `Conv2d` |
| **Residual Blocks** | `ResidualBlock2d` · `ResNetBasicBlock` · `ResNetBottleneck` |
| **Normalization** | `BatchNorm2d` · `LayerNorm` |
| **Activation Functions** | `ReLU` · `GELU` |
| **Pooling** | `MaxPool2d` · `AdaptiveAvgPool2d` |
| **Transformer Family** | `SelfAttention` · `TransformerEncoder` · `TransformerDecoder` · `PatchEmbedding` · `TokenPool` |
| **Recurrent Networks** | `LSTM` · `GRU` |
| **Embeddings** | `Embedding` |
| **Linear & Regularization** | `Linear` · `Flatten` · `Dropout` |
| **Fusion Ops** | `Add` (residual/skip) · `Concat` (multi-branch) |

</div>

### 📦 Import & Export — Plays Well with Your Workflow

<table>
<tr>
<td width="25%" align="center"><strong>📄 Graph JSON</strong><br /><small>Full round-trip serialization<br />Edit in any text editor</small></td>
<td width="25%" align="center"><strong>🔥 PyTorch Code</strong><br /><small>Clean nn.Module generation<br />Ready for training</small></td>
<td width="25%" align="center"><strong>🧩 ONNX Models</strong><br /><small>Import .onnx / .pb files<br />Visualize existing models</small></td>
<td width="25%" align="center"><strong>📝 Text Definitions</strong><br /><small>Parse .py / .txt model specs<br />Migrate legacy code</small></td>
</tr>
</table>

### 🌐 Quality of Life

- **🇨🇳 🇺🇸 Bilingual UI** — Chinese / English switch with persistent preference (localStorage)
- **💾 Remembered State** — sidebar collapse and locale survive page reloads
- **📋 One-Click Copy** — Graph JSON and PyTorch code straight to clipboard
- **⚡ 7 Model Presets** — load classic architectures as starting points
- **🎯 Zero Dependencies on Backend** — runs entirely in the browser, no Python required

<br />

---

<br />

## 🖥️ <a id="-ui-layout"></a>UI Layout

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
│  │ ReLU     │ │   │ In │──▶│ Conv │─▶│Out │ │  · tensor shapes   │
│  │ Linear   │ │   │    │   │      │  │    │ │                    │
│  │ ...      │ │   └────┘   └──────┘  └────┘ │  Validator         │
│  └──────────┘ │                              │  · errors          │
│               │   <b style="color:#94a3b8">[⛶ Fullscreen]</b>             │  · warnings        │
│  Model        │                              │  · info            │
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

## 🎯 <a id="-presets"></a>Built-in Model Presets

> One click to load a complete, ready-to-edit architecture.

<div align="center">

| Preset | Architecture | Use Case |
|:--|:--|:--|
| 🟦 **Simple CNN** | `Input` only | Blank slate — build from scratch |
| 🟩 **ResNet-18** | BasicBlock × 8 | Image classification, transfer learning |
| 🟩 **ResNet-50** | Bottleneck × 16 | Deep feature extraction, object detection backbone |
| 🟨 **VGG-16** | 13×Conv + 3×FC | Classic baseline, style transfer |
| 🟪 **LSTM Classifier** | BiLSTM → Linear | Sentiment analysis, time-series forecasting |
| 🟧 **Transformer Seq2Seq** | Encoder + Decoder | Machine translation, text summarization |
| 🟥 **DINOv3-style ViT** | PatchEmbed + Encoder | Modern vision transformer, self-supervised learning |

</div>

<br />

---

<br />

## 📁 <a id="-project-structure"></a>Project Structure

<pre style="background:#0f172a;color:#e2e8f0;padding:1.2rem;border-radius:12px;font-size:0.84rem;line-height:1.7;overflow-x:auto;">
<b style="color:#60a5fa">src/</b>
├── <b style="color:#60a5fa">core/</b>
│   ├── codegen/          <b style="color:#94a3b8">→ generatePyTorch.ts — nn.Module code emitter</b>
│   ├── graph/            <b style="color:#94a3b8">→ NeuralGraph types, parameter counting</b>
│   ├── import/           <b style="color:#94a3b8">→ ONNX / text model definition parser</b>
│   ├── registry/         <b style="color:#94a3b8">→ Layer definitions &amp; default parameters</b>
│   ├── serialize/        <b style="color:#94a3b8">→ Graph JSON serialization / deserialization</b>
│   ├── shape/            <b style="color:#94a3b8">→ Forward tensor shape inference engine</b>
│   └── validate/         <b style="color:#94a3b8">→ Graph structural rule checker</b>
├── <b style="color:#60a5fa">editor/</b>              <b style="color:#94a3b8">→ Canvas, sidebars, inspector, export UI components</b>
├── <b style="color:#60a5fa">examples/</b>           <b style="color:#94a3b8">→ 7 model presets + default blank graph</b>
├── i18n.ts               <b style="color:#94a3b8">→ Chinese / English translation tables</b>
├── App.tsx               <b style="color:#94a3b8">→ Main application shell &amp; state management</b>
└── App.css               <b style="color:#94a3b8">→ Global styles (CSS custom properties, responsive)</b>
</pre>

<br />

---

<br />

## 🗺️ <a id="-roadmap"></a>Roadmap

<table>
<tr>
<td width="33%">

### 🔜 Short Term
- Stricter port-type compatibility checks
- Delete node / delete edge interactions
- Undo / redo history stack

</td>
<td width="33%">

### 📋 Medium Term
- Multi-branch codegen for `Add` / `Concat` fusion
- FLOPs / MACs estimation
- Node search & filter across large graphs
- Keyboard shortcuts

</td>
<td width="33%">

### 🌟 Long Term
- IndexedDB local persistence & auto-save
- `.json` / `.py` file download
- Training configuration export (optimizer, loss, scheduler)
- TensorBoard graph protocol export
- Collaborative editing (CRDT / WebSocket)

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
| **Graph Canvas** | [React Flow](https://reactflow.dev) (`@xyflow/react` v12) |
| **UI Framework** | React 19 + TypeScript 6 |
| **Build Tool** | Vite 8 (Rolldown) |
| **Code Generation** | Template-driven PyTorch `nn.Module` emitter |
| **ONNX Parsing** | `onnx-proto` (protobuf decoding) |
| **Unique IDs** | `nanoid` |
| **Styling** | Plain CSS + custom properties + glassmorphism design |
| **I18n** | Custom lightweight solution (no framework dependency) |

</div>

<br />

---

<div align="center">

<br />

## 🏷️ Keywords

<sub>
`neural network editor` · `visual model builder` · `PyTorch designer` · `deep learning canvas` ·
`no-code AI` · `drag-and-drop neural network` · `CNN architect` · `Transformer visualizer` ·
`model architecture tool` · `ONNX viewer` · `ResNet builder` · `LSTM designer` ·
`deep learning education` · `model prototyping` · `graph-based NN editor` ·
`open source` · `React Flow` · `TypeScript` · `browser-based` · `research tool`
</sub>

<br /><br />

## 📄 License

**[MIT](LICENSE)** © 2026 NasNeo

<br />

<p>
  <a href="README_CN.md">📖 中文文档</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/NasNeo/NNMind">⭐ Star on GitHub</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/NasNeo/NNMind/issues">🐛 Report Bug</a>
</p>

<br />

<img src="https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F%20and%20coffee-fbbf24?style=flat-square" alt="made with love" />

</div>