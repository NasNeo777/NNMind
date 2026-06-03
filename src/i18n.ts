import type {GraphIssue, GraphLayoutMode, LayerCategory, LayerType} from "./core/graph/types"

export type Locale = "en" | "zh"

type PresetCopy = {
    title: string
    family: string
    description: string
}

const layerLabelsZh: Partial<Record<LayerType, string>> = {
    Input: "输入",
    Embedding: "嵌入",
    Conv2d: "二维卷积",
    ResidualBlock2d: "残差块 2D",
    ResNetBasicBlock: "ResNet 基础块",
    ResNetBottleneck: "ResNet 瓶颈块",
    BatchNorm2d: "二维批归一化",
    LayerNorm: "层归一化",
    ReLU: "ReLU",
    GELU: "GELU",
    MaxPool2d: "二维最大池化",
    AdaptiveAvgPool2d: "二维自适应平均池化",
    PatchEmbedding: "Patch 嵌入",
    TokenPool: "Token 池化",
    Flatten: "展平",
    Linear: "全连接",
    Dropout: "随机失活",
    LSTM: "LSTM",
    GRU: "GRU",
    SelfAttention: "自注意力",
    TransformerEncoder: "Transformer 编码器",
    TransformerDecoder: "Transformer 解码器",
    Add: "逐元素相加",
    Concat: "拼接",
    Output: "输出",
}

const layerDescriptionsZh: Partial<Record<LayerType, string>> = {
    Input: "图结构的输入张量。",
    Embedding: "把 token id 映射成稠密向量。",
    Conv2d: "标准二维卷积层。",
    ResidualBlock2d: "带可选投影捷径的 ResNet 风格残差块。",
    ResNetBasicBlock: "ResNet-18/34 使用的双层残差块。",
    ResNetBottleneck: "ResNet-50/101 使用的三层瓶颈残差块。",
    BatchNorm2d: "按通道做归一化。",
    LayerNorm: "对最后若干特征维做归一化。",
    ReLU: "经典非线性激活。",
    GELU: "更适合 Transformer 的平滑激活。",
    MaxPool2d: "对空间特征做下采样。",
    AdaptiveAvgPool2d: "把输出空间尺寸收敛到固定大小。",
    PatchEmbedding: "把图像切成 patch 并投影成 token。",
    TokenPool: "把 token 序列池化成单个向量。",
    Flatten: "展平特征维度。",
    Linear: "全连接投影，支持二维或序列张量。",
    Dropout: "训练时随机置零一部分特征。",
    LSTM: "带循环记忆的序列编码/解码模块。",
    GRU: "更轻量的循环序列模块。",
    SelfAttention: "对 token 序列执行单层自注意力。",
    TransformerEncoder: "堆叠的自注意力编码器层。",
    TransformerDecoder: "对目标 token 和 memory 做交叉注意力。",
    Add: "对 shape 一致的张量做逐元素合并。",
    Concat: "沿指定维度拼接张量。",
    Output: "图结构的输出节点。",
}

const paramLabelsZh: Partial<Record<string, string>> = {
    shape: "形状",
    dtype: "数据类型",
    num_embeddings: "词表大小",
    embedding_dim: "嵌入维度",
    in_channels: "输入通道",
    out_channels: "输出通道",
    kernel_size: "卷积核",
    stride: "步幅",
    padding: "填充",
    dilation: "膨胀",
    bias: "偏置",
    use_projection: "投影捷径",
    bottleneck_channels: "瓶颈通道",
    num_features: "特征数",
    normalized_shape: "归一化形状",
    inplace: "原地执行",
    output_size: "输出尺寸",
    patch_size: "Patch 尺寸",
    embed_dim: "嵌入维度",
    mode: "模式",
    start_dim: "起始维度",
    end_dim: "结束维度",
    in_features: "输入特征",
    out_features: "输出特征",
    p: "失活概率",
    input_size: "输入维度",
    hidden_size: "隐藏维度",
    num_layers: "层数",
    dropout: "Dropout",
    bidirectional: "双向",
    batch_first: "Batch 在前",
    return_sequences: "返回序列",
    num_heads: "头数",
    d_model: "模型维度",
    nhead: "头数",
    dim_feedforward: "前馈层维度",
    activation: "激活函数",
    dim: "拼接维度",
}

const categoryLabelsZh: Record<LayerCategory, string> = {
    input: "输入",
    embedding: "嵌入",
    conv: "卷积",
    residual: "残差",
    norm: "归一化",
    activation: "激活",
    pool: "池化",
    transformer: "Transformer",
    sequence: "序列",
    attention: "注意力",
    reshape: "形状变换",
    linear: "线性",
    merge: "合并",
    output: "输出",
}

const presetCopy: Record<Locale, Record<string, PresetCopy>> = {
    zh: {
        "simple-cnn": {
            title: "Simple CNN",
            family: "入门样例",
            description: "包含单个输入节点的空白画布，方便快速搭建自己的网络。",
        },
        resnet18: {
            title: "ResNet-18",
            family: "经典 CNN",
            description: "由 ResNet BasicBlock 组成的经典残差网络骨架。",
        },
        resnet50: {
            title: "ResNet-50",
            family: "经典 CNN",
            description: "由 ResNet Bottleneck 组成的更深残差网络骨架。",
        },
        vgg16: {
            title: "VGG-16",
            family: "经典 CNN",
            description: "多层卷积堆叠到大分类头的经典 VGG 结构。",
        },
        "lstm-classifier": {
            title: "LSTM Classifier",
            family: "序列模型",
            description: "双向 LSTM 的文本/时序分类链路。",
        },
        "transformer-seq2seq": {
            title: "Transformer Seq2Seq",
            family: "编解码器",
            description: "双输入的 Transformer encoder-decoder 预设。",
        },
        "dinov3-style-vit": {
            title: "DINOv3-style ViT",
            family: "现代视觉",
            description: "PatchEmbedding + TransformerEncoder 的现代视觉骨架。",
        },
    },
    en: {
        "simple-cnn": {
            title: "Simple CNN",
            family: "Starter",
            description: "A blank canvas with a single input node, perfect for quickly building your own network.",
        },
        resnet18: {
            title: "ResNet-18",
            family: "Classic CNN",
            description: "A classic residual network skeleton built from ResNet BasicBlocks.",
        },
        resnet50: {
            title: "ResNet-50",
            family: "Classic CNN",
            description: "A deeper residual backbone built from ResNet Bottlenecks.",
        },
        vgg16: {
            title: "VGG-16",
            family: "Classic CNN",
            description: "The canonical VGG stack of conv blocks and a large classifier head.",
        },
        "lstm-classifier": {
            title: "LSTM Classifier",
            family: "Sequence",
            description: "A bidirectional LSTM pipeline for text or time-series classification.",
        },
        "transformer-seq2seq": {
            title: "Transformer Seq2Seq",
            family: "Encoder-Decoder",
            description: "A two-input Transformer encoder-decoder preset.",
        },
        "dinov3-style-vit": {
            title: "DINOv3-style ViT",
            family: "Modern Vision",
            description: "A modern vision backbone with PatchEmbedding and TransformerEncoder blocks.",
        },
    },
}

const uiText = {
    zh: {
        language: "语言",
        english: "English",
        chinese: "中文",
        appEyebrow: "NNMind Extended",
        appTitle: "可视化神经网络图编辑器",
        appDescription: "支持 Transformer 编解码、LSTM/GRU、模型预设、模型文件导入、参数量统计，以及横向/竖向两种阅读模式。",
        totalParams: "总参数量",
        nodes: "节点数",
        issues: "问题数",
        resetSample: "重置样例",
        switchToVertical: "切换为纵向",
        switchToHorizontal: "切换为横向",
        copyGraphJson: "复制 Graph JSON",
        copyPyTorch: "复制 PyTorch",
        leftSidebar: "左侧工具栏",
        rightSidebar: "右侧工具栏",
        collapse: "收起",
        expand: "展开",
        quickAddTitle: "快速添加",
        quickAddHintIdle: "先选一个节点，再从这里快速加入常用模块。",
        quickAddHintSelected: (name: string) => `当前选中 ${name}，新节点会插到它后面。`,
        search: "搜索",
        searchPlaceholder: "conv、bottleneck、attention、lstm...",
        presetTitle: "Model Presets",
        presetDescription: "一键载入经典 CNN、序列模型和 Transformer 编解码骨架。",
        canvasTitle: "图画布",
        fullscreen: "全屏",
        exitFullscreen: "退出全屏",
        layout: "布局",
        edges: "连线数",
        inspectorTitle: "检查器",
        inspectorEmpty: "选择一个节点后，这里会出现参数面板。",
        nodeName: "名称",
        params: "参数量",
        exactParams: "精确值",
        inputPort: "输入",
        outputPort: "输出",
        validatorTitle: "校验器",
        validatorHealthy: "当前图没有发现问题。",
        validatorFound: (count: number) => `共发现 ${count} 条提示。`,
        validatorHealthyDetail: "当前图已经满足 MVP 导出链路的基本要求。",
        exportTitle: "导入与导出",
        exportDescription: "支持导出 Graph JSON / PyTorch，也支持导入 Graph JSON、PyTorch `.py/.txt`，以及 ONNX `.onnx/.pb` 模型文件。",
        copyJson: "复制 JSON",
        loadDraftJson: "载入草稿 JSON",
        importModelFile: "导入模型文件",
        graphJson: "Graph JSON",
        importDraft: "导入草稿",
        connectionMenuTitleNext: "添加下一个节点",
        connectionMenuTitlePrevious: "添加上一个节点",
        connectionMenuHintNext: "从这里选一个模块，系统会自动把它接到当前输出端口后面。",
        connectionMenuHintPrevious: "从这里选一个模块，系统会自动把它接到当前输入端口前面。",
        connectionMenuSearchPlaceholder: "搜索要插入的节点...",
        connectionMenuEmpty: "没有匹配的节点类型。",
        cancel: "取消",
        unsupportedCheckpoint:
            "暂不支持导入 checkpoint 权重文件。请导入 Graph JSON、PyTorch .py、ONNX，或纯文本模型定义文件。",
        importFailed: "导入失败。",
        layoutHorizontal: "横向",
        layoutVertical: "纵向",
        error: "错误",
        warning: "警告",
        info: "提示",
    },
    en: {
        language: "Language",
        english: "English",
        chinese: "Chinese",
        appEyebrow: "NNMind Extended",
        appTitle: "Visual Neural Graph Editor",
        appDescription: "Build Transformer, LSTM/GRU, CNN, and custom PyTorch-style graphs with presets, model import, parameter counting, and switchable reading layouts.",
        totalParams: "Total Params",
        nodes: "Nodes",
        issues: "Issues",
        resetSample: "Reset Sample",
        switchToVertical: "Switch To Vertical",
        switchToHorizontal: "Switch To Horizontal",
        copyGraphJson: "Copy Graph JSON",
        copyPyTorch: "Copy PyTorch",
        leftSidebar: "Left Sidebar",
        rightSidebar: "Right Sidebar",
        collapse: "Collapse",
        expand: "Expand",
        quickAddTitle: "Quick Add",
        quickAddHintIdle: "Select a node first, then add common blocks from here.",
        quickAddHintSelected: (name: string) => `With ${name} selected, new nodes will be inserted right after it.`,
        search: "Search",
        searchPlaceholder: "conv, bottleneck, attention, lstm...",
        presetTitle: "Model Presets",
        presetDescription: "Load classic CNNs, sequence models, and Transformer encoder-decoder skeletons in one click.",
        canvasTitle: "Graph Canvas",
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit Fullscreen",
        layout: "Layout",
        edges: "Edges",
        inspectorTitle: "Inspector",
        inspectorEmpty: "Select a node to inspect and edit its parameters here.",
        nodeName: "Name",
        params: "Params",
        exactParams: "Exact",
        inputPort: "Input",
        outputPort: "Output",
        validatorTitle: "Validator",
        validatorHealthy: "No issues found in the current graph.",
        validatorFound: (count: number) => `${count} issue${count === 1 ? "" : "s"} found.`,
        validatorHealthyDetail: "The graph is healthy enough for the MVP export path.",
        exportTitle: "Export & Import",
        exportDescription: "Export Graph JSON or PyTorch, and import Graph JSON, PyTorch `.py/.txt`, or ONNX `.onnx/.pb` model files.",
        copyJson: "Copy JSON",
        loadDraftJson: "Load Draft JSON",
        importModelFile: "Import Model File",
        graphJson: "Graph JSON",
        importDraft: "Import Draft",
        connectionMenuTitleNext: "Add Next Node",
        connectionMenuTitlePrevious: "Add Previous Node",
        connectionMenuHintNext: "Pick a block and it will be connected after the current output handle.",
        connectionMenuHintPrevious: "Pick a block and it will be connected before the current input handle.",
        connectionMenuSearchPlaceholder: "Search a node to insert...",
        connectionMenuEmpty: "No matching node types.",
        cancel: "Cancel",
        unsupportedCheckpoint:
            "Checkpoint weights are not supported yet. Please import Graph JSON, PyTorch .py, ONNX, or a text model definition file.",
        importFailed: "Import failed.",
        layoutHorizontal: "Horizontal",
        layoutVertical: "Vertical",
        error: "Error",
        warning: "Warning",
        info: "Info",
    },
} as const

export function getUiText(locale: Locale) {
    return uiText[locale]
}

export function getLayerLabel(type: LayerType, fallback: string, locale: Locale): string {
    return locale === "zh" ? layerLabelsZh[type] ?? fallback : fallback
}

export function getLayerDescription(type: LayerType, fallback: string, locale: Locale): string {
    return locale === "zh" ? layerDescriptionsZh[type] ?? fallback : fallback
}

export function getLayerCategoryLabel(category: LayerCategory, locale: Locale): string {
    return locale === "zh" ? categoryLabelsZh[category] : category
}

export function getParamLabel(name: string, fallback: string, locale: Locale): string {
    return locale === "zh" ? paramLabelsZh[name] ?? fallback : fallback
}

export function getPresetCopy(
    presetId: string,
    fallback: PresetCopy,
    locale: Locale,
): PresetCopy {
    return presetCopy[locale][presetId] ?? fallback
}

export function formatExactParamCount(locale: Locale, count: number): string {
    return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(count)
}

export function formatLayoutMode(locale: Locale, layoutMode: GraphLayoutMode): string {
    if (layoutMode === "horizontal") {
        return locale === "zh" ? uiText.zh.layoutHorizontal : uiText.en.layoutHorizontal
    }

    return locale === "zh" ? uiText.zh.layoutVertical : uiText.en.layoutVertical
}

export function formatIssueLevel(locale: Locale, level: GraphIssue["level"]): string {
    if (level === "error") {
        return uiText[locale].error
    }

    if (level === "warning") {
        return uiText[locale].warning
    }

    return uiText[locale].info
}

type PatternTranslator = {
    pattern: RegExp
    render: (...groups: string[]) => string
}

const issueMessagePatternsEn: PatternTranslator[] = [
    {pattern: /^图中至少需要一个 Input 节点。$/, render: () => "The graph needs at least one Input node."},
    {
        pattern: /^当前图包含多个 Input 节点，适合编解码器等多输入结构。$/,
        render: () => "The graph contains multiple Input nodes, which is fine for encoder-decoder or other multi-input architectures.",
    },
    {pattern: /^图中至少需要一个 Output 节点。$/, render: () => "The graph needs at least one Output node."},
    {
        pattern: /^图中存在环路。请移除循环连接。$/,
        render: () => "A cycle was detected in the graph. Remove the looped connections."
    },
    {pattern: /^(.+) 是孤立节点。$/, render: (name) => `${name} is isolated.`},
    {pattern: /^Input 不应该有入边。$/, render: () => "Input nodes should not have incoming edges."},
    {pattern: /^Output 不应该有出边。$/, render: () => "Output nodes should not have outgoing edges."},
    {
        pattern: /^(.+) 需要 (\d+) 个输入端口，当前只有 (\d+) 个连接。$/,
        render: (name, expected, actual) => `${name} expects ${expected} input ports, but only has ${actual} incoming connections.`,
    },
    {
        pattern: /^Flatten 后特征数较大 \((\d+)\)，建议考虑 AdaptiveAvgPool2d。$/,
        render: (features) => `Flatten produces a large feature vector (${features}). Consider AdaptiveAvgPool2d.`,
    },
    {pattern: /^无效的图 JSON 格式。$/, render: () => "Invalid graph JSON format."},
    {pattern: /^Embedding 需要 1D 或 2D token tensor。$/, render: () => "Embedding expects a 1D or 2D token tensor."},
    {pattern: /^Conv2d 需要 4D Tensor: \[B, C, H, W\]$/, render: () => "Conv2d expects a 4D tensor: [B, C, H, W]."},
    {
        pattern: /^Conv2d 推导结果无效，请检查 kernel \/ stride \/ padding。$/,
        render: () => "Conv2d inference produced an invalid shape. Check kernel, stride, and padding.",
    },
    {pattern: /^ResidualBlock2d 需要 4D Tensor。$/, render: () => "ResidualBlock2d expects a 4D tensor."},
    {
        pattern: /^ResidualBlock2d 若不使用 projection，输入输出通道必须一致。$/,
        render: () => "ResidualBlock2d requires matching input/output channels when projection is disabled.",
    },
    {pattern: /^ResNetBottleneck 需要 4D Tensor。$/, render: () => "ResNetBottleneck expects a 4D tensor."},
    {
        pattern: /^ResNetBottleneck 若不使用 projection，输入输出通道必须一致。$/,
        render: () => "ResNetBottleneck requires matching input/output channels when projection is disabled.",
    },
    {pattern: /^BatchNorm2d 需要 4D Tensor。$/, render: () => "BatchNorm2d expects a 4D tensor."},
    {
        pattern: /^LayerNorm normalized_shape 不能超过输入 rank。$/,
        render: () => "LayerNorm normalized_shape cannot exceed the input rank.",
    },
    {pattern: /^MaxPool2d 需要 4D Tensor。$/, render: () => "MaxPool2d expects a 4D tensor."},
    {pattern: /^AdaptiveAvgPool2d 需要 4D Tensor。$/, render: () => "AdaptiveAvgPool2d expects a 4D tensor."},
    {pattern: /^PatchEmbedding 需要 4D 图像张量。$/, render: () => "PatchEmbedding expects a 4D image tensor."},
    {
        pattern: /^PatchEmbedding 需要高度可以被 patch size 整除。$/,
        render: () => "PatchEmbedding requires the height to be divisible by the patch size.",
    },
    {
        pattern: /^PatchEmbedding 需要宽度可以被 patch size 整除。$/,
        render: () => "PatchEmbedding requires the width to be divisible by the patch size.",
    },
    {pattern: /^TokenPool 需要 3D token 序列。$/, render: () => "TokenPool expects a 3D token sequence."},
    {pattern: /^TokenPool\(cls\) 至少需要一个 token。$/, render: () => "TokenPool(cls) requires at least one token."},
    {pattern: /^Flatten 维度范围无效。$/, render: () => "Flatten received an invalid dimension range."},
    {pattern: /^Linear 至少需要 2D Tensor。$/, render: () => "Linear expects at least a 2D tensor."},
    {
        pattern: /^TransformerEncoder 需要 3D token 序列。$/,
        render: () => "TransformerEncoder expects a 3D token sequence."
    },
    {pattern: /^SelfAttention 需要 3D token 序列。$/, render: () => "SelfAttention expects a 3D token sequence."},
    {
        pattern: /^TransformerDecoder 需要 3D target 与 memory。$/,
        render: () => "TransformerDecoder expects 3D target and memory tensors.",
    },
    {
        pattern: /^TransformerDecoder target 与 memory 的 batch 必须一致。$/,
        render: () => "TransformerDecoder requires target and memory to share the same batch size.",
    },
    {pattern: /^Add 需要两个输入。$/, render: () => "Add expects two inputs."},
    {pattern: /^Add 两边 shape 不一致。$/, render: () => "Add requires matching input shapes."},
    {pattern: /^Concat 需要两个输入。$/, render: () => "Concat expects two inputs."},
    {pattern: /^Concat 维度超出范围。$/, render: () => "Concat received an out-of-range dimension."},
    {pattern: /^Concat 输入 rank 不一致。$/, render: () => "Concat requires inputs with the same rank."},
    {
        pattern: /^Concat 除拼接维度外 shape 必须一致。$/,
        render: () => "Concat requires all shapes except the concatenation dimension to match.",
    },
    {
        pattern: /^Graph 存在环，无法完成 shape 推导。$/,
        render: () => "Shape inference cannot run because the graph contains a cycle."
    },
    {pattern: /^Shape 推导失败。$/, render: () => "Shape inference failed."},
]

export function translateMessage(locale: Locale, message: string): string {
    if (locale === "zh") {
        return message
    }

    for (const entry of issueMessagePatternsEn) {
        const match = message.match(entry.pattern)
        if (match) {
            return entry.render(...match.slice(1))
        }
    }

    return message
}
