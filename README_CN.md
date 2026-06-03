<div align="center">

<img src="https://img.shields.io/badge/NNMind-v0.1.0-2563eb?style=for-the-badge&logo=react&logoColor=white" alt="version" />
<img src="https://img.shields.io/badge/react-19-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="react" />
<img src="https://img.shields.io/badge/typescript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
<img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge&logo=bookstack&logoColor=white" alt="license" />

<br /><br />

<h1>🧠 NNMind</h1>

<h3><em>面向 PyTorch 的可视化神经网络编辑器</em></h3>

<p>
  拖拽 · 连线 · 检查 · 导出<br />
  在无限画布上搭建神经网络架构——
  从一个 <code>Input</code> 节点到完整的 ResNet 或 Transformer。
</p>

<br />

<p>
  <a href="#快速启动">快速启动</a> ·
  <a href="#功能特性">功能特性</a> ·
  <a href="#界面布局">界面布局</a> ·
  <a href="#内置预设">内置预设</a> ·
  <a href="#项目结构">项目结构</a> ·
  <a href="#后续计划">后续计划</a> ·
  <a href="README.md">English Docs</a>
</p>

</div>

<br />

---

<br />

## ✨ 功能特性

<table>
<tr>
<td width="50%">

### 🎨 画布
- **拖拽连线**——基于 React Flow 的无限画布，自定义层节点
- **全屏模式**——一键将画布扩展至整个视口，沉浸式编辑
- **收起的侧栏**——不需要时一键折叠，给画布腾出空间
- **横/纵向切换**——一套数据，两种阅读视角，一键切换
- **内联连接菜单**——从端口拖到空白处，搜索并插入新层

</td>
<td width="50%">

### 🔬 检查器
- **逐节点参数量**——画布上显示缩写值，检查器里显示精确值
- **实时总参数量**——编辑节点时顶部栏即时更新
- **张量 shape 推导**——前向传播 shape，每个节点展示输入/输出规格
- **图结构校验器**——检测缺失 I/O、环路、孤立节点、端口不匹配和 shape 错误

</td>
</tr>
</table>

### 🧱 30+ 内置图层类型

<div align="center">

| 类别 | 图层 |
|:--|:--|
| **输入/输出** | `Input` · `Output` |
| **卷积** | `Conv2d` |
| **残差** | `ResidualBlock2d` · `ResNetBasicBlock` · `ResNetBottleneck` |
| **归一化** | `BatchNorm2d` · `LayerNorm` |
| **激活** | `ReLU` · `GELU` |
| **池化** | `MaxPool2d` · `AdaptiveAvgPool2d` |
| **Transformer** | `SelfAttention` · `TransformerEncoder` · `TransformerDecoder` · `PatchEmbedding` · `TokenPool` |
| **序列** | `LSTM` · `GRU` |
| **嵌入** | `Embedding` |
| **线性** | `Linear` · `Flatten` · `Dropout` |
| **合并** | `Add` · `Concat` |

</div>

### 📦 导入与导出

<table>
<tr>
<td width="25%" align="center"><strong>📄 Graph JSON</strong><br /><small>完整往返</small></td>
<td width="25%" align="center"><strong>🔥 PyTorch</strong><br /><small>nn.Module 代码生成</small></td>
<td width="25%" align="center"><strong>🧩 ONNX</strong><br /><small>.onnx / .pb 导入</small></td>
<td width="25%" align="center"><strong>📝 文本</strong><br /><small>.py / .txt 导入</small></td>
</tr>
</table>

### 🌐 体验细节

- **🇨🇳 🇺🇸 中英文界面**——语言切换，偏好自动持久化
- **💾 侧栏状态**——收起/展开设置跨会话记忆
- **📋 一键复制**——Graph JSON 和 PyTorch 代码一键复制到剪贴板
- **⚡ 7 个预设**——一键载入经典架构

<br />

---

<br />

## 🚀 <a id="快速启动"></a>快速启动

<div align="center">

```bash
git clone https://github.com/NasNeo/NNMind.git
cd NNMind
npm install
npm run dev
```

浏览器访问 **[http://localhost:5173](http://localhost:5173)**

</div>

<br />

| 命令 | 说明 |
|:--|:--|
| `npm run dev` | 启动开发服务器（HMR） |
| `npm run build` | 类型检查 + 生产构建 → `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | 运行 ESLint |

<br />

---

<br />

## 🖥️ <a id="界面布局"></a>界面布局

<pre style="background:#0f172a;color:#e2e8f0;padding:1.5rem;border-radius:16px;font-size:0.82rem;line-height:1.6;overflow-x:auto;">
┌──────────────────────────────────────────────────────────────────┐
│  <b style="color:#60a5fa">顶部栏</b>                                                            │
│  总参数量 · 节点数 · 问题数                                          │
│  语言切换 · 布局切换 · 复制 JSON/PyTorch · 重置样例                    │
├───────────────┬──────────────────────────────┬────────────────────┤
│ <b style="color:#34d399">左侧工具栏</b>  │                              │ <b style="color:#f472b6">右侧工具栏</b>      │
│  (可收起)     │                              │  (可收起)          │
│               │       <b style="color:#fbbf24">图画布</b>             │                    │
│  快速添加     │                              │  检查器            │
│  ┌──────────┐ │   ┌────┐   ┌──────┐  ┌────┐ │  · 名称            │
│  │ Conv2d   │ │   │    │   │      │  │    │ │  · 参数            │
│  │ ReLU     │ │   │ In │──▶│ Conv │─▶│Out │ │  · Shape          │
│  │ Linear   │ │   │    │   │      │  │    │ │                    │
│  │ ...      │ │   └────┘   └──────┘  └────┘ │  校验器            │
│  └──────────┘ │                              │  · 错误            │
│               │   <b style="color:#94a3b8">[⛶ 全屏]</b>                │  · 警告            │
│  Model        │                              │                    │
│  Presets      ├──────────────────────────────┤                    │
│  ┌──────────┐ │                              │                    │
│  │ ResNet-18│ │  导入与导出                   │                    │
│  │ VGG-16   │ │  · 复制 JSON / PyTorch       │                    │
│  │ ViT      │ │  · 载入草稿 JSON             │                    │
│  │ ...      │ │  · 导入模型文件               │                    │
│  └──────────┘ │                              │                    │
└───────────────┴──────────────────────────────┴────────────────────┘
</pre>

<br />

---

<br />

## 🎯 <a id="内置预设"></a>内置预设

<div align="center">

| 预设 | 架构 | 说明 |
|:--|:--|:--|
| 🟦 **Simple CNN** | 仅 `Input` | 空白画布，自由搭建 |
| 🟩 **ResNet-18** | BasicBlock × 8 | 经典 18 层残差网络 |
| 🟩 **ResNet-50** | Bottleneck × 16 | 深度 50 层残差骨架 |
| 🟨 **VGG-16** | 13×Conv + 3×FC | 卷积-池化堆叠 + 分类头 |
| 🟪 **LSTM Classifier** | BiLSTM → Linear | 文本/时序分类链路 |
| 🟧 **Transformer Seq2Seq** | Encoder + Decoder | 双输入编解码 Transformer |
| 🟥 **DINOv3-style ViT** | PatchEmbed + Encoder | 现代视觉 Transformer 骨架 |

</div>

<br />

---

<br />

## 📁 <a id="项目结构"></a>项目结构

<pre style="background:#0f172a;color:#e2e8f0;padding:1.2rem;border-radius:12px;font-size:0.84rem;line-height:1.7;overflow-x:auto;">
<b style="color:#60a5fa">src/</b>
├── <b style="color:#60a5fa">core/</b>
│   ├── codegen/          <b style="color:#94a3b8">PyTorch nn.Module 代码生成</b>
│   ├── graph/            <b style="color:#94a3b8">NeuralGraph 类型 · 参数量统计</b>
│   ├── import/           <b style="color:#94a3b8">ONNX / 文本模型定义解析</b>
│   ├── registry/         <b style="color:#94a3b8">图层定义与默认参数</b>
│   ├── serialize/        <b style="color:#94a3b8">Graph JSON 序列化</b>
│   ├── shape/            <b style="color:#94a3b8">前向张量 shape 推导</b>
│   └── validate/         <b style="color:#94a3b8">图结构校验</b>
├── <b style="color:#60a5fa">editor/</b>              <b style="color:#94a3b8">画布、侧栏、检查器、导出 UI</b>
├── <b style="color:#60a5fa">examples/</b>           <b style="color:#94a3b8">7 个模型预设 + 默认图</b>
├── i18n.ts               <b style="color:#94a3b8">中英文翻译</b>
├── App.tsx               <b style="color:#94a3b8">主应用框架</b>
└── App.css               <b style="color:#94a3b8">全局样式（CSS 自定义属性）</b>
</pre>

<br />

---

<br />

## 🗺️ <a id="后续计划"></a>后续计划

<table>
<tr>
<td width="33%">

### 🔜 短期
- 更严格的端口类型校验
- 删除节点 / 删除边
- 撤销 / 重做

</td>
<td width="33%">

### 📋 中期
- `Add` / `Concat` 多分支代码生成
- FLOPs 估算
- 节点搜索与过滤

</td>
<td width="33%">

### 🌟 长期
- IndexedDB 本地持久化
- `.json` / `.py` 文件下载
- 训练配置导出
- TensorBoard 图导出

</td>
</tr>
</table>

<br />

---

<br />

## 🛠️ 技术栈

<div align="center">

| 层级 | 选型 |
|:--|:--|
| **画布** | [React Flow](https://reactflow.dev) (`@xyflow/react`) |
| **UI 框架** | React 19 + TypeScript 6 |
| **构建工具** | Vite 8 |
| **代码生成** | 模板驱动 PyTorch `nn.Module` 生成 |
| **ONNX 解析** | `onnx-proto` |
| **样式** | 纯 CSS + 自定义属性 |

</div>

<br />

---

<div align="center">

<br />

## 📄 开源协议

**[MIT](LICENSE)** © 2026 NasNeo

<br />

<p>
  <a href="README.md">📖 English Docs</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/NasNeo/NNMind">⭐ Star on GitHub</a>
</p>

<br />

<img src="https://img.shields.io/badge/%E7%94%A8-%E2%9D%A4%EF%B8%8F%20%E5%92%8C%20%E5%92%96%E5%95%A1%E5%88%B6%E4%BD%9C-fbbf24?style=flat-square" alt="made with love" />

</div>