import type { LayerNode, LayerType, NeuralGraph, ParamValue } from "../core/graph/types"
import { createDefaultParams } from "../core/registry/layerRegistry"
import { simpleCnnGraph } from "./simpleCnn"

export type GraphPreset = {
  id: string
  title: string
  family: string
  description: string
  graph: NeuralGraph
}

function makeNode(
  id: string,
  name: string,
  layerType: LayerType,
  x: number,
  y: number,
  overrides: Record<string, ParamValue> = {},
): LayerNode {
  return {
    id,
    name,
    layerType,
    position: { x, y },
    params: {
      ...createDefaultParams(layerType),
      ...overrides,
    },
  }
}

function makeEdge(from: string, to: string, toPort = "in", fromPort = "out") {
  return {
    id: `e-${from}-${to}-${toPort}`,
    fromNodeId: from,
    fromPort,
    toNodeId: to,
    toPort,
  }
}

function makeResNet18Graph(): NeuralGraph {
  const nodes: LayerNode[] = [
    makeNode("resnet_input", "image", "Input", 0, 160),
    makeNode("resnet_stem", "stem_conv", "Conv2d", 220, 160, {
      in_channels: 3,
      out_channels: 64,
      kernel_size: [7, 7],
      stride: [2, 2],
      padding: [3, 3],
      dilation: [1, 1],
      bias: false,
    }),
    makeNode("resnet_bn", "stem_bn", "BatchNorm2d", 430, 160, { num_features: 64 }),
    makeNode("resnet_relu", "stem_relu", "ReLU", 620, 160),
    makeNode("resnet_pool", "stem_pool", "MaxPool2d", 820, 160, {
      kernel_size: [3, 3],
      stride: [2, 2],
      padding: [1, 1],
    }),
    makeNode("res1", "layer1_0", "ResNetBasicBlock", 1040, 160, { in_channels: 64, out_channels: 64, stride: 1, use_projection: false }),
    makeNode("res2", "layer1_1", "ResNetBasicBlock", 1270, 160, { in_channels: 64, out_channels: 64, stride: 1, use_projection: false }),
    makeNode("res3", "layer2_0", "ResNetBasicBlock", 1500, 160, { in_channels: 64, out_channels: 128, stride: 2, use_projection: true }),
    makeNode("res4", "layer2_1", "ResNetBasicBlock", 1730, 160, { in_channels: 128, out_channels: 128, stride: 1, use_projection: false }),
    makeNode("res5", "layer3_0", "ResNetBasicBlock", 1960, 160, { in_channels: 128, out_channels: 256, stride: 2, use_projection: true }),
    makeNode("res6", "layer3_1", "ResNetBasicBlock", 2190, 160, { in_channels: 256, out_channels: 256, stride: 1, use_projection: false }),
    makeNode("res7", "layer4_0", "ResNetBasicBlock", 2420, 160, { in_channels: 256, out_channels: 512, stride: 2, use_projection: true }),
    makeNode("res8", "layer4_1", "ResNetBasicBlock", 2650, 160, { in_channels: 512, out_channels: 512, stride: 1, use_projection: false }),
    makeNode("resnet_gap", "avgpool", "AdaptiveAvgPool2d", 2880, 160, { output_size: [1, 1] }),
    makeNode("resnet_flatten", "flatten", "Flatten", 3090, 160),
    makeNode("resnet_fc", "fc", "Linear", 3280, 160, { in_features: 512, out_features: 1000 }),
    makeNode("resnet_output", "output", "Output", 3490, 160),
  ]

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => makeEdge(node.id, nodes[index + 1].id)),
  }
}

function makeResNet50Graph(): NeuralGraph {
  const nodes: LayerNode[] = [
    makeNode("res50_input", "image", "Input", 0, 160),
    makeNode("res50_stem", "stem_conv", "Conv2d", 220, 160, {
      in_channels: 3,
      out_channels: 64,
      kernel_size: [7, 7],
      stride: [2, 2],
      padding: [3, 3],
      dilation: [1, 1],
      bias: false,
    }),
    makeNode("res50_bn", "stem_bn", "BatchNorm2d", 430, 160, { num_features: 64 }),
    makeNode("res50_relu", "stem_relu", "ReLU", 620, 160),
    makeNode("res50_pool", "stem_pool", "MaxPool2d", 820, 160, {
      kernel_size: [3, 3],
      stride: [2, 2],
      padding: [1, 1],
    }),
    makeNode("res50_l1_0", "layer1_0", "ResNetBottleneck", 1040, 160, { in_channels: 64, bottleneck_channels: 64, out_channels: 256, stride: 1, use_projection: true }),
    makeNode("res50_l1_1", "layer1_1", "ResNetBottleneck", 1280, 160, { in_channels: 256, bottleneck_channels: 64, out_channels: 256, stride: 1, use_projection: false }),
    makeNode("res50_l1_2", "layer1_2", "ResNetBottleneck", 1520, 160, { in_channels: 256, bottleneck_channels: 64, out_channels: 256, stride: 1, use_projection: false }),
    makeNode("res50_l2_0", "layer2_0", "ResNetBottleneck", 1760, 160, { in_channels: 256, bottleneck_channels: 128, out_channels: 512, stride: 2, use_projection: true }),
    makeNode("res50_l2_1", "layer2_1", "ResNetBottleneck", 2000, 160, { in_channels: 512, bottleneck_channels: 128, out_channels: 512, stride: 1, use_projection: false }),
    makeNode("res50_l3_0", "layer3_0", "ResNetBottleneck", 2240, 160, { in_channels: 512, bottleneck_channels: 256, out_channels: 1024, stride: 2, use_projection: true }),
    makeNode("res50_l3_1", "layer3_1", "ResNetBottleneck", 2480, 160, { in_channels: 1024, bottleneck_channels: 256, out_channels: 1024, stride: 1, use_projection: false }),
    makeNode("res50_l4_0", "layer4_0", "ResNetBottleneck", 2720, 160, { in_channels: 1024, bottleneck_channels: 512, out_channels: 2048, stride: 2, use_projection: true }),
    makeNode("res50_l4_1", "layer4_1", "ResNetBottleneck", 2960, 160, { in_channels: 2048, bottleneck_channels: 512, out_channels: 2048, stride: 1, use_projection: false }),
    makeNode("res50_gap", "avgpool", "AdaptiveAvgPool2d", 3200, 160, { output_size: [1, 1] }),
    makeNode("res50_flatten", "flatten", "Flatten", 3410, 160),
    makeNode("res50_fc", "fc", "Linear", 3620, 160, { in_features: 2048, out_features: 1000 }),
    makeNode("res50_output", "output", "Output", 3830, 160),
  ]

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => makeEdge(node.id, nodes[index + 1].id)),
  }
}

function makeVgg16Graph(): NeuralGraph {
  const layers: Array<{ id: string; name: string; type: LayerType; overrides?: Record<string, ParamValue> }> = [
    { id: "vgg_input", name: "image", type: "Input" },
    { id: "vgg_conv1_1", name: "conv1_1", type: "Conv2d", overrides: { in_channels: 3, out_channels: 64, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu1_1", name: "relu1_1", type: "ReLU" },
    { id: "vgg_conv1_2", name: "conv1_2", type: "Conv2d", overrides: { in_channels: 64, out_channels: 64, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu1_2", name: "relu1_2", type: "ReLU" },
    { id: "vgg_pool1", name: "pool1", type: "MaxPool2d" },
    { id: "vgg_conv2_1", name: "conv2_1", type: "Conv2d", overrides: { in_channels: 64, out_channels: 128, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu2_1", name: "relu2_1", type: "ReLU" },
    { id: "vgg_conv2_2", name: "conv2_2", type: "Conv2d", overrides: { in_channels: 128, out_channels: 128, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu2_2", name: "relu2_2", type: "ReLU" },
    { id: "vgg_pool2", name: "pool2", type: "MaxPool2d" },
    { id: "vgg_conv3_1", name: "conv3_1", type: "Conv2d", overrides: { in_channels: 128, out_channels: 256, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu3_1", name: "relu3_1", type: "ReLU" },
    { id: "vgg_conv3_2", name: "conv3_2", type: "Conv2d", overrides: { in_channels: 256, out_channels: 256, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu3_2", name: "relu3_2", type: "ReLU" },
    { id: "vgg_conv3_3", name: "conv3_3", type: "Conv2d", overrides: { in_channels: 256, out_channels: 256, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu3_3", name: "relu3_3", type: "ReLU" },
    { id: "vgg_pool3", name: "pool3", type: "MaxPool2d" },
    { id: "vgg_conv4_1", name: "conv4_1", type: "Conv2d", overrides: { in_channels: 256, out_channels: 512, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu4_1", name: "relu4_1", type: "ReLU" },
    { id: "vgg_conv4_2", name: "conv4_2", type: "Conv2d", overrides: { in_channels: 512, out_channels: 512, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu4_2", name: "relu4_2", type: "ReLU" },
    { id: "vgg_conv4_3", name: "conv4_3", type: "Conv2d", overrides: { in_channels: 512, out_channels: 512, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu4_3", name: "relu4_3", type: "ReLU" },
    { id: "vgg_pool4", name: "pool4", type: "MaxPool2d" },
    { id: "vgg_conv5_1", name: "conv5_1", type: "Conv2d", overrides: { in_channels: 512, out_channels: 512, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu5_1", name: "relu5_1", type: "ReLU" },
    { id: "vgg_conv5_2", name: "conv5_2", type: "Conv2d", overrides: { in_channels: 512, out_channels: 512, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu5_2", name: "relu5_2", type: "ReLU" },
    { id: "vgg_conv5_3", name: "conv5_3", type: "Conv2d", overrides: { in_channels: 512, out_channels: 512, kernel_size: [3, 3], stride: [1, 1], padding: [1, 1], dilation: [1, 1], bias: true } },
    { id: "vgg_relu5_3", name: "relu5_3", type: "ReLU" },
    { id: "vgg_pool5", name: "pool5", type: "MaxPool2d" },
    { id: "vgg_gap", name: "avgpool", type: "AdaptiveAvgPool2d", overrides: { output_size: [7, 7] } },
    { id: "vgg_flatten", name: "flatten", type: "Flatten" },
    { id: "vgg_fc1", name: "fc1", type: "Linear", overrides: { in_features: 25088, out_features: 4096 } },
    { id: "vgg_relu_fc1", name: "relu_fc1", type: "ReLU" },
    { id: "vgg_drop1", name: "drop1", type: "Dropout" },
    { id: "vgg_fc2", name: "fc2", type: "Linear", overrides: { in_features: 4096, out_features: 4096 } },
    { id: "vgg_relu_fc2", name: "relu_fc2", type: "ReLU" },
    { id: "vgg_drop2", name: "drop2", type: "Dropout" },
    { id: "vgg_fc3", name: "classifier", type: "Linear", overrides: { in_features: 4096, out_features: 1000 } },
    { id: "vgg_output", name: "output", type: "Output" },
  ]

  const nodes = layers.map((layer, index) => makeNode(layer.id, layer.name, layer.type, index * 180, 180, layer.overrides))

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => makeEdge(node.id, nodes[index + 1].id)),
  }
}

function makeLstmClassifierGraph(): NeuralGraph {
  const nodes: LayerNode[] = [
    makeNode("lstm_input", "tokens", "Input", 0, 160, { shape: ["B", 200, 300] }),
    makeNode("lstm_encoder", "lstm", "LSTM", 260, 160, {
      input_size: 300,
      hidden_size: 256,
      num_layers: 2,
      dropout: 0.2,
      bidirectional: true,
      batch_first: true,
      return_sequences: false,
    }),
    makeNode("lstm_dropout", "dropout", "Dropout", 520, 160, { p: 0.2 }),
    makeNode("lstm_head", "classifier", "Linear", 760, 160, { in_features: 512, out_features: 5 }),
    makeNode("lstm_output", "output", "Output", 980, 160),
  ]

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => makeEdge(node.id, nodes[index + 1].id)),
  }
}

function makeTransformerSeq2SeqGraph(): NeuralGraph {
  const nodes: LayerNode[] = [
    makeNode("src_input", "src_tokens", "Input", 0, 70, { shape: ["B", 128], dtype: "int64" }),
    makeNode("src_embed", "src_embed", "Embedding", 240, 70, { num_embeddings: 32000, embedding_dim: 512 }),
    makeNode("encoder", "encoder", "TransformerEncoder", 520, 70, { d_model: 512, nhead: 8, num_layers: 6, dim_feedforward: 2048, dropout: 0.1, activation: "gelu" }),
    makeNode("tgt_input", "tgt_tokens", "Input", 0, 300, { shape: ["B", 64], dtype: "int64" }),
    makeNode("tgt_embed", "tgt_embed", "Embedding", 240, 300, { num_embeddings: 32000, embedding_dim: 512 }),
    makeNode("decoder", "decoder", "TransformerDecoder", 820, 180, { d_model: 512, nhead: 8, num_layers: 6, dim_feedforward: 2048, dropout: 0.1, activation: "gelu" }),
    makeNode("decoder_norm", "decoder_norm", "LayerNorm", 1080, 180, { normalized_shape: [512] }),
    makeNode("token_head", "token_head", "Linear", 1320, 180, { in_features: 512, out_features: 32000 }),
    makeNode("transformer_output", "output", "Output", 1560, 180),
  ]

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges: [
      makeEdge("src_input", "src_embed"),
      makeEdge("src_embed", "encoder"),
      makeEdge("tgt_input", "tgt_embed"),
      makeEdge("tgt_embed", "decoder", "tgt"),
      makeEdge("encoder", "decoder", "memory"),
      makeEdge("decoder", "decoder_norm"),
      makeEdge("decoder_norm", "token_head"),
      makeEdge("token_head", "transformer_output"),
    ],
  }
}

function makeDinov3StyleGraph(): NeuralGraph {
  const nodes: LayerNode[] = [
    makeNode("dino_input", "image", "Input", 0, 160),
    makeNode("dino_patch", "patch_embed", "PatchEmbedding", 260, 160, { in_channels: 3, patch_size: [14, 14], embed_dim: 768 }),
    makeNode("dino_norm1", "pre_norm", "LayerNorm", 500, 160, { normalized_shape: [768] }),
    makeNode("dino_encoder", "encoder", "TransformerEncoder", 760, 160, { d_model: 768, nhead: 12, num_layers: 12, dim_feedforward: 3072, dropout: 0.1, activation: "gelu" }),
    makeNode("dino_norm2", "post_norm", "LayerNorm", 1030, 160, { normalized_shape: [768] }),
    makeNode("dino_pool", "token_pool", "TokenPool", 1270, 160, { mode: "mean" }),
    makeNode("dino_head", "head", "Linear", 1490, 160, { in_features: 768, out_features: 1000 }),
    makeNode("dino_output", "output", "Output", 1710, 160),
  ]

  return {
    version: 1,
    framework: "pytorch",
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => makeEdge(node.id, nodes[index + 1].id)),
  }
}

export const modelPresets: GraphPreset[] = [
  {
    id: "simple-cnn",
    title: "Simple CNN",
    family: "Starter",
    description: "包含单个输入节点的空白画布，方便快速搭建自己的网络。",
    graph: simpleCnnGraph,
  },
  {
    id: "resnet18",
    title: "ResNet-18",
    family: "Classic CNN",
    description: "使用 ResNet BasicBlock 组合出的经典残差网络骨架。",
    graph: makeResNet18Graph(),
  },
  {
    id: "resnet50",
    title: "ResNet-50",
    family: "Classic CNN",
    description: "使用 ResNet Bottleneck 组合出的更深残差网络骨架。",
    graph: makeResNet50Graph(),
  },
  {
    id: "vgg16",
    title: "VGG-16",
    family: "Classic CNN",
    description: "多层卷积堆叠到大分类头的经典 VGG 结构。",
    graph: makeVgg16Graph(),
  },
  {
    id: "lstm-classifier",
    title: "LSTM Classifier",
    family: "Sequence",
    description: "双向 LSTM 文本/时序分类链路。",
    graph: makeLstmClassifierGraph(),
  },
  {
    id: "transformer-seq2seq",
    title: "Transformer Seq2Seq",
    family: "Encoder-Decoder",
    description: "双输入的 Transformer encoder-decoder 预设。",
    graph: makeTransformerSeq2SeqGraph(),
  },
  {
    id: "dinov3-style-vit",
    title: "DINOv3-style ViT",
    family: "Modern Vision",
    description: "PatchEmbedding + TransformerEncoder 的新模型风格骨架。",
    graph: makeDinov3StyleGraph(),
  },
]
