import type { LayerNode, ParamValue } from "./types"

function asNumber(value: ParamValue, fallback: number): number {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function asBoolean(value: ParamValue, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function asTuple(value: ParamValue, fallback: number[]): number[] {
  return Array.isArray(value) && value.length > 0
    ? value.map((item, index) => asNumber(item as ParamValue, fallback[index] ?? fallback[0] ?? 1))
    : fallback
}

function product(values: number[]): number {
  return values.reduce((total, value) => total * value, 1)
}

function countRnnParams(node: LayerNode, gates: number): number {
  const inputSize = asNumber(node.params.input_size, 300)
  const hiddenSize = asNumber(node.params.hidden_size, 256)
  const numLayers = asNumber(node.params.num_layers, 1)
  const bidirectional = asBoolean(node.params.bidirectional, false)
  const directions = bidirectional ? 2 : 1

  let total = 0

  for (let layerIndex = 0; layerIndex < numLayers; layerIndex += 1) {
    const layerInput = layerIndex === 0 ? inputSize : hiddenSize * directions
    const oneDirection =
      gates * hiddenSize * layerInput +
      gates * hiddenSize * hiddenSize +
      gates * hiddenSize * 2

    total += oneDirection * directions
  }

  return total
}

export function estimateNodeParamCount(node: LayerNode): number {
  switch (node.layerType) {
    case "Embedding":
      return asNumber(node.params.num_embeddings, 32000) * asNumber(node.params.embedding_dim, 512)
    case "Conv2d": {
      const inChannels = asNumber(node.params.in_channels, 3)
      const outChannels = asNumber(node.params.out_channels, 32)
      const kernel = asTuple(node.params.kernel_size, [3, 3])
      const bias = asBoolean(node.params.bias, true)
      return outChannels * inChannels * product(kernel) + (bias ? outChannels : 0)
    }
    case "ResidualBlock2d": {
      const inChannels = asNumber(node.params.in_channels, 64)
      const outChannels = asNumber(node.params.out_channels, 64)
      const stride = asNumber(node.params.stride, 1)
      const useProjection = asBoolean(node.params.use_projection, false) || stride !== 1 || inChannels !== outChannels
      const conv1 = outChannels * inChannels * 3 * 3
      const bn1 = outChannels * 2
      const conv2 = outChannels * outChannels * 3 * 3
      const bn2 = outChannels * 2
      const projection = useProjection ? outChannels * inChannels + outChannels * 2 : 0
      return conv1 + bn1 + conv2 + bn2 + projection
    }
    case "ResNetBasicBlock": {
      const inChannels = asNumber(node.params.in_channels, 64)
      const outChannels = asNumber(node.params.out_channels, 64)
      const stride = asNumber(node.params.stride, 1)
      const useProjection = asBoolean(node.params.use_projection, false) || stride !== 1 || inChannels !== outChannels
      const conv1 = outChannels * inChannels * 3 * 3
      const bn1 = outChannels * 2
      const conv2 = outChannels * outChannels * 3 * 3
      const bn2 = outChannels * 2
      const projection = useProjection ? outChannels * inChannels + outChannels * 2 : 0
      return conv1 + bn1 + conv2 + bn2 + projection
    }
    case "ResNetBottleneck": {
      const inChannels = asNumber(node.params.in_channels, 256)
      const bottleneck = asNumber(node.params.bottleneck_channels, 64)
      const outChannels = asNumber(node.params.out_channels, 256)
      const stride = asNumber(node.params.stride, 1)
      const useProjection = asBoolean(node.params.use_projection, false) || stride !== 1 || inChannels !== outChannels
      const conv1 = inChannels * bottleneck
      const bn1 = bottleneck * 2
      const conv2 = bottleneck * bottleneck * 3 * 3
      const bn2 = bottleneck * 2
      const conv3 = bottleneck * outChannels
      const bn3 = outChannels * 2
      const projection = useProjection ? inChannels * outChannels + outChannels * 2 : 0
      return conv1 + bn1 + conv2 + bn2 + conv3 + bn3 + projection
    }
    case "BatchNorm2d":
      return asNumber(node.params.num_features, 32) * 2
    case "LayerNorm":
      return product(asTuple(node.params.normalized_shape, [512])) * 2
    case "PatchEmbedding": {
      const inChannels = asNumber(node.params.in_channels, 3)
      const embedDim = asNumber(node.params.embed_dim, 768)
      const patch = asTuple(node.params.patch_size, [14, 14])
      return inChannels * embedDim * product(patch) + embedDim
    }
    case "Linear": {
      const inFeatures = asNumber(node.params.in_features, 128)
      const outFeatures = asNumber(node.params.out_features, 10)
      const bias = asBoolean(node.params.bias, true)
      return inFeatures * outFeatures + (bias ? outFeatures : 0)
    }
    case "LSTM":
      return countRnnParams(node, 4)
    case "GRU":
      return countRnnParams(node, 3)
    case "SelfAttention": {
      const dModel = asNumber(node.params.embed_dim, 512)
      return 4 * dModel * dModel + 4 * dModel
    }
    case "TransformerEncoder": {
      const dModel = asNumber(node.params.d_model, 512)
      const ff = asNumber(node.params.dim_feedforward, 2048)
      const layers = asNumber(node.params.num_layers, 6)
      const attn = 4 * dModel * dModel + 4 * dModel
      const ffn = dModel * ff + ff + ff * dModel + dModel
      const norms = 4 * dModel
      return layers * (attn + ffn + norms)
    }
    case "TransformerDecoder": {
      const dModel = asNumber(node.params.d_model, 512)
      const ff = asNumber(node.params.dim_feedforward, 2048)
      const layers = asNumber(node.params.num_layers, 6)
      const selfAttn = 4 * dModel * dModel + 4 * dModel
      const crossAttn = 4 * dModel * dModel + 4 * dModel
      const ffn = dModel * ff + ff + ff * dModel + dModel
      const norms = 6 * dModel
      return layers * (selfAttn + crossAttn + ffn + norms)
    }
    default:
      return 0
  }
}

export function formatParamCount(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(2)}B`
  }

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)}M`
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(2)}K`
  }

  return String(count)
}
