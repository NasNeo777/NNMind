# NNMind

[中文](#中文说明) | [English](#english)

## 中文说明

NNMind 是一个面向 PyTorch 工作流的可视化神经网络结构编辑器。你可以在画布上搭建 CNN、RNN、Transformer 等网络骨架，实时查看张量 shape、节点参数量、图结构问题，并导出 Graph JSON 或 PyTorch 代码。

### 这版包含什么

- 可拖拽、可连线的 React Flow 画布
- 左右工具栏可收起，给画布腾出更多空间
- 中文 / English 界面切换
- 每个节点都显示参数量，检查器里同时显示缩写值和精确值
- `Quick Add` 图层库
- `Model Presets` 预设模型库
- 横向 / 纵向两种阅读布局
- Graph JSON 导入导出
- PyTorch 代码导出
- ONNX / 文本模型定义导入
- 基础 shape 推导与图结构校验

### 快速启动

```bash
npm install
npm run dev
```

默认开发地址：

```txt
http://127.0.0.1:5173/
```

生产构建：

```bash
npm run build
```

### 主要界面说明

- 左侧工具栏：`Quick Add` + `Model Presets`，都支持收起
- 中间区域：主画布与导入导出面板
- 右侧工具栏：节点检查器与校验结果，也支持收起
- 顶部栏：语言切换、布局切换、复制 JSON / PyTorch、样例重置

### 当前内置预设

- `Simple CNN`
- `ResNet-18`
- `ResNet-50`
- `VGG-16`
- `LSTM Classifier`
- `Transformer Seq2Seq`
- `DINOv3-style ViT`

### 目录结构

```txt
src/
  core/
    codegen/      # PyTorch 导出
    graph/        # 图结构与参数量统计
    import/       # ONNX / 文本模型导入
    registry/     # 图层定义
    serialize/    # Graph JSON 序列化
    shape/        # shape 推导
    validate/     # 图校验
  editor/         # 画布、侧栏、检查器等 UI
  examples/       # 预设模型
```

### 适合继续扩展的方向

- 更严格的端口类型校验
- 删除节点 / 删除边 / 撤销重做
- 多分支 `Add / Concat` 的更完整代码导出
- 本地持久化、文件下载与分享
- 更细的参数量与 FLOPs 统计

## English

NNMind is a visual neural-network editor for PyTorch-style workflows. It lets you assemble CNN, RNN, and Transformer graphs on a canvas, inspect tensor shapes and parameter counts, validate graph structure, and export Graph JSON or PyTorch code.

### What is included

- Drag-and-connect React Flow canvas
- Collapsible left and right sidebars to free up canvas space
- Chinese / English UI switching
- Per-node parameter counts on the canvas plus exact counts in the inspector
- `Quick Add` layer palette
- `Model Presets` library
- Horizontal / vertical reading layouts
- Graph JSON import and export
- PyTorch code export
- ONNX / text model-definition import
- Basic shape inference and graph validation

### Quick start

```bash
npm install
npm run dev
```

Default dev URL:

```txt
http://127.0.0.1:5173/
```

Production build:

```bash
npm run build
```

### UI layout

- Left sidebar: `Quick Add` and `Model Presets`, both collapsible
- Center: main graph canvas and import/export panel
- Right sidebar: node inspector and validator, also collapsible
- Top bar: language toggle, layout toggle, copy JSON / PyTorch, reset sample

### Built-in presets

- `Simple CNN`
- `ResNet-18`
- `ResNet-50`
- `VGG-16`
- `LSTM Classifier`
- `Transformer Seq2Seq`
- `DINOv3-style ViT`

### Project structure

```txt
src/
  core/
    codegen/      # PyTorch export
    graph/        # graph types and parameter counting
    import/       # ONNX / text model import
    registry/     # layer definitions
    serialize/    # Graph JSON serialization
    shape/        # shape inference
    validate/     # graph validation
  editor/         # canvas and UI panels
  examples/       # model presets
```

### Good next steps

- Stricter port compatibility checks
- Delete node / delete edge / undo-redo
- More complete export for branched `Add / Concat` graphs
- Local persistence, download, and sharing
- Richer parameter and FLOPs reporting
