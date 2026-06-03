<div align="center">

<img src="https://img.shields.io/badge/NNMind-v0.1.0-2563eb?style=for-the-badge&logo=react&logoColor=white" alt="version" />
<img src="https://img.shields.io/badge/react-19-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="react" />
<img src="https://img.shields.io/badge/typescript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
<img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge&logo=bookstack&logoColor=white" alt="license" />
<a href="https://github.com/NasNeo/NNMind"><img src="https://img.shields.io/github/stars/NasNeo/NNMind?style=for-the-badge&logo=github&color=fbbf24" alt="stars" /></a>

<br /><br />

<h1>🧠 NNMind</h1>

<h2><em>开源可视化神经网络设计器 &amp; PyTorch 模型搭建工具</em></h2>

<p>
  <strong>拖拽 · 连线 · 检查 · 导出</strong><br />
  面向研究人员、工程师和学生的<strong>无代码深度学习架构编辑器</strong>。<br />
  在<strong>交互式图画布</strong>上设计 CNN、RNN、LSTM、GRU 和 Transformer 模型——<br />
  从一个 <code>Input</code> 节点到 ResNet、VGG、ViT 等工业级架构。
</p>

<br />

<table>
<tr>
<td align="center">🎨<br /><strong>可视化图编辑器</strong><br />拖拽式神经网络设计</td>
<td align="center">🔬<br /><strong>实时 Shape 推导</strong><br />张量维度即时追踪</td>
<td align="center">📊<br /><strong>参数量统计</strong><br />逐节点与总量统计</td>
<td align="center">🔥<br /><strong>PyTorch 代码生成</strong><br />一键导出 nn.Module</td>
</tr>
</table>

<br />

<p>
  <a href="#-为什么选择-nnmind">为什么选择</a> ·
  <a href="#-快速启动">快速启动</a> ·
  <a href="#-功能特性">功能特性</a> ·
  <a href="#-界面布局">界面布局</a> ·
  <a href="#-内置预设">内置预设</a> ·
  <a href="#-项目结构">项目结构</a> ·
  <a href="#-后续计划">后续计划</a> ·
  <a href="README.md">English Docs</a>
</p>

</div>

<br />

---

<br />

## 💡 <a id="-为什么选择-nnmind"></a>为什么选择 NNMind？

> **告别样板代码。直接看见你的模型。**

无论你是在**原型验证新架构**、**教授深度学习概念**，还是**逆向分析 ONNX 模型**——NNMind 用**直观的可视化界面**替代数百行枯燥的 `nn.Module` 连线代码，让你在**拖拽画布**上完成一切。

<table>
<tr>
<td width="33%">

### 🎓 教学利器
交互式展示**前向传播**过程，逐层查看**张量 shape**，理解**参数分布**。非常适合**深度学习课程**、**工作坊**和**自学**。

</td>
<td width="33%">

### 🔬 科研助手
快速**草图新架构**，在写代码之前验证 **shape 兼容性**，导出**干净 PyTorch 代码**直接训练。适合**论文原型**和**消融实验**。

</td>
<td width="33%">

### 🏭 工程工具
导入 **ONNX 模型**可视化已有架构，用内置校验器排查 **shape 不匹配**，生成**生产级 nn.Module 代码**。适合**模型评审**和**新人上手**。

</td>
</tr>
</table>

<br />

---

<br />

## 🚀 <a id="-快速启动"></a>快速启动

```bash
git clone https://github.com/NasNeo/NNMind.git
cd NNMind
npm install
npm run dev
```

浏览器访问 **[http://localhost:5173](http://localhost:5173)** ——你会看到一个只有 Input 节点的画布，开始搭建吧。

<br />

| 命令 | 说明 |
|:--|:--|
| `npm run dev` | 启动开发服务器（热模块替换） |
| `npm run build` | 类型检查 + 生产构建 → `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | 运行 ESLint |

<br />

---

<br />

## ✨ <a id="-功能特性"></a>功能特性

<table>
<tr>
<td width="50%">

### 🎨 交互式图画布
- **拖拽式层节点**——在无限 React Flow 画布上自由摆放
- **全屏模式**——一键扩展至全视口，沉浸式模型设计
- **可收起侧栏**——不需要时折叠，释放屏幕空间
- **横向 ↔ 纵向布局**——一套数据，两种阅读视角，一键切换
- **内联连接菜单**——从端口拖到空白处，搜索图层并插入
- **自定义节点渲染**——每种层类型有独立视觉标识和颜色编码

</td>
<td width="50%">

### 🔬 实时模型检查
- **逐节点参数量**——画布上显示缩写值，检查器中显示精确值
- **实时总量汇总**——增减或重连节点时即时更新
- **前向张量 shape 传播**——每个节点的输入/输出维度即时计算并展示
- **图结构校验器**——检测缺失 I/O、环路依赖、孤立节点、端口不匹配和 shape 不兼容
- **问题严重级别**——错误、警告和提示，支持中英文消息

</td>
</tr>
</table>

### 🧱 30+ 内置图层类型——开箱即用

<div align="center">

| 类别 | 图层 |
|:--|:--|
| **输入/输出** | `Input` · `Output` |
| **卷积** | `Conv2d` |
| **残差块** | `ResidualBlock2d` · `ResNetBasicBlock` · `ResNetBottleneck` |
| **归一化** | `BatchNorm2d` · `LayerNorm` |
| **激活函数** | `ReLU` · `GELU` |
| **池化** | `MaxPool2d` · `AdaptiveAvgPool2d` |
| **Transformer 家族** | `SelfAttention` · `TransformerEncoder` · `TransformerDecoder` · `PatchEmbedding` · `TokenPool` |
| **循环网络** | `LSTM` · `GRU` |
| **嵌入** | `Embedding` |
| **线性与正则化** | `Linear` · `Flatten` · `Dropout` |
| **融合操作** | `Add`（残差跳跃连接）· `Concat`（多分支合并） |

</div>

### 📦 导入与导出——融入你的工作流

<table>
<tr>
<td width="25%" align="center"><strong>📄 Graph JSON</strong><br /><small>完整往返序列化<br />可在任何编辑器修改</small></td>
<td width="25%" align="center"><strong>🔥 PyTorch 代码</strong><br /><small>干净的 nn.Module 生成<br />可直接训练</small></td>
<td width="25%" align="center"><strong>🧩 ONNX 模型</strong><br /><small>导入 .onnx / .pb 文件<br />可视化已有模型</small></td>
<td width="25%" align="center"><strong>📝 文本定义</strong><br /><small>解析 .py / .txt 模型<br />迁移遗留代码</small></td>
</tr>
</table>

### 🌐 体验细节

- **🇨🇳 🇺🇸 双语界面**——中文/英文切换，偏好自动持久化（localStorage）
- **💾 状态记忆**——侧栏收起状态和语言选择跨会话保留
- **📋 一键复制**——Graph JSON 和 PyTorch 代码一键到剪贴板
- **⚡ 7 个模型预设**——一键载入经典架构作为起点
- **🎯 纯前端运行**——完全在浏览器中运行，无需 Python 后端

<br />

---

<br />

## 🖥️ <a id="-界面布局"></a>界面布局

<pre align="center" style="background:#0f172a;color:#e2e8f0;padding:1.5rem;border-radius:16px;font-size:0.82rem;line-height:1.6;overflow-x:auto;">
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
│  │ ReLU     │ │   │ In │──▶│ Conv │─▶│Out │ │  · 张量 Shape      │
│  │ Linear   │ │   │    │   │      │  │    │ │                    │
│  │ ...      │ │   └────┘   └──────┘  └────┘ │  校验器            │
│  └──────────┘ │                              │  · 错误            │
│               │   <b style="color:#94a3b8">[⛶ 全屏]</b>                │  · 警告            │
│  Model        │                              │  · 提示            │
│  Presets      ├──────────────────────────────┤                    │
│  ┌──────────┐ │                              │                    │
│  │ ResNet-18│ │  导入与导出面板               │                    │
│  │ VGG-16   │ │  · 复制 JSON / PyTorch       │                    │
│  │ ViT      │ │  · 载入草稿 JSON             │                    │
│  │ ...      │ │  · 导入模型文件               │                    │
│  └──────────┘ │                              │                    │
└───────────────┴──────────────────────────────┴────────────────────┘
</pre>

<br />

---

<br />

## 🎯 <a id="-内置预设"></a>内置模型预设

> 一键加载完整、可编辑的架构。

<div align="center">

| 预设 | 架构 | 适用场景 |
|:--|:--|:--|
| 🟦 **Simple CNN** | 仅 `Input` | 空白画布，自由搭建 |
| 🟩 **ResNet-18** | BasicBlock × 8 | 图像分类、迁移学习 |
| 🟩 **ResNet-50** | Bottleneck × 16 | 深度特征提取、目标检测骨干 |
| 🟨 **VGG-16** | 13×Conv + 3×FC | 经典基线、风格迁移 |
| 🟪 **LSTM Classifier** | BiLSTM → Linear | 情感分析、时序预测 |
| 🟧 **Transformer Seq2Seq** | Encoder + Decoder | 机器翻译、文本摘要 |
| 🟥 **DINOv3-style ViT** | PatchEmbed + Encoder | 现代视觉 Transformer、自监督学习 |

</div>

<br />

---

<br />

## 📁 <a id="-项目结构"></a>项目结构

<pre style="background:#0f172a;color:#e2e8f0;padding:1.2rem;border-radius:12px;font-size:0.84rem;line-height:1.7;overflow-x:auto;">
<b style="color:#60a5fa">src/</b>
├── <b style="color:#60a5fa">core/</b>
│   ├── codegen/          <b style="color:#94a3b8">→ generatePyTorch.ts — nn.Module 代码生成器</b>
│   ├── graph/            <b style="color:#94a3b8">→ NeuralGraph 类型定义、参数量统计</b>
│   ├── import/           <b style="color:#94a3b8">→ ONNX / 文本模型定义解析器</b>
│   ├── registry/         <b style="color:#94a3b8">→ 图层定义与默认参数</b>
│   ├── serialize/        <b style="color:#94a3b8">→ Graph JSON 序列化 / 反序列化</b>
│   ├── shape/            <b style="color:#94a3b8">→ 前向张量 shape 推导引擎</b>
│   └── validate/         <b style="color:#94a3b8">→ 图结构规则检查器</b>
├── <b style="color:#60a5fa">editor/</b>              <b style="color:#94a3b8">→ 画布、侧栏、检查器、导出 UI 组件</b>
├── <b style="color:#60a5fa">examples/</b>           <b style="color:#94a3b8">→ 7 个模型预设 + 默认空白图</b>
├── i18n.ts               <b style="color:#94a3b8">→ 中文 / 英文翻译表</b>
├── App.tsx               <b style="color:#94a3b8">→ 主应用框架与状态管理</b>
└── App.css               <b style="color:#94a3b8">→ 全局样式（CSS 自定义属性、响应式）</b>
</pre>

<br />

---

<br />

## 🗺️ <a id="-后续计划"></a>后续计划

<table>
<tr>
<td width="33%">

### 🔜 短期
- 更严格的端口类型兼容检查
- 删除节点 / 删除边交互
- 撤销 / 重做历史栈

</td>
<td width="33%">

### 📋 中期
- `Add` / `Concat` 多分支代码生成
- FLOPs / MACs 计算量估算
- 大图节点搜索与过滤
- 键盘快捷键

</td>
<td width="33%">

### 🌟 长期
- IndexedDB 本地持久化与自动保存
- `.json` / `.py` 文件下载
- 训练配置导出（优化器、损失函数、学习率调度器）
- TensorBoard 图协议导出
- 多人协作编辑（CRDT / WebSocket）

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
| **图画布** | [React Flow](https://reactflow.dev) (`@xyflow/react` v12) |
| **UI 框架** | React 19 + TypeScript 6 |
| **构建工具** | Vite 8 (Rolldown) |
| **代码生成** | 模板驱动 PyTorch `nn.Module` 生成 |
| **ONNX 解析** | `onnx-proto`（protobuf 解码） |
| **唯一 ID** | `nanoid` |
| **样式方案** | 纯 CSS + 自定义属性 + 毛玻璃设计 |
| **国际化** | 自研轻量方案（无框架依赖） |

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
  &nbsp;·&nbsp;
  <a href="https://github.com/NasNeo/NNMind/issues">🐛 报告问题</a>
</p>

<br />

<img src="https://img.shields.io/badge/%E7%94%A8-%E2%9D%A4%EF%B8%8F%20%E5%92%8C%20%E5%92%96%E5%95%A1%E5%88%B6%E4%BD%9C-fbbf24?style=flat-square" alt="made with love" />

</div>