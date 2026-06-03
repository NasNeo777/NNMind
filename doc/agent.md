下面给你一个**可落地开发计划**。目标不是空想“3D神经网络编辑器”，而是先做出一个能生成 PyTorch 代码、能检查 shape 错误的 MVP。

---

# 总目标

做一个：

> **可视化神经网络结构编辑器**

核心能力：

```txt
拖节点 -> 连线 -> 配参数 -> 自动推导 Tensor Shape -> 校验错误 -> 导出 PyTorch 代码
```

第一版不要追求酷炫 3D。
你的第一版目标应该是：**能用，不是好看。**

---

# 技术选型建议

## 推荐方案

```txt
前端：React + TypeScript
图编辑：React Flow / 自己写 Canvas
3D展示：Three.js，放到后期
后端：可选，第一版不需要
代码生成：TypeScript 生成 Python 文本
```

如果你坚持 3D：

```txt
Three.js + React Three Fiber
```

但我建议：

```txt
第一版 2D 编辑器
第二版 2.5D 展示
第三版 3D 网络空间
```

原因很简单：
**神经网络结构的核心难点是 shape 推导和代码生成，不是3D拖拽。**

---

# 开发阶段总览

| 阶段     | 目标             | 时间     |
| ------ | -------------- | ------ |
| 第 1 阶段 | 图数据结构 + 节点连接   | 3-5 天  |
| 第 2 阶段 | 层类型系统          | 3-5 天  |
| 第 3 阶段 | Shape 推导       | 5-10 天 |
| 第 4 阶段 | 参数编辑器          | 3-5 天  |
| 第 5 阶段 | PyTorch 代码生成   | 5-7 天  |
| 第 6 阶段 | 错误校验系统         | 3-5 天  |
| 第 7 阶段 | 保存 / 加载 / 示例模板 | 2-4 天  |
| 第 8 阶段 | 3D 可视化         | 7-14 天 |

第一版大概：

```txt
3 - 6 周
```

注意：这是认真做的时间，不是幻想两天做完。

---

# 第 1 阶段：图数据结构

## 目标

先让系统知道：

```txt
有哪些节点
节点在哪里
节点之间怎么连
```

## 数据结构

```ts
export type TensorShape = Array<number | "B" | null>

export type TensorSpec = {
  dtype: "float32" | "float16" | "int64"
  shape: TensorShape
}

export type LayerNode = {
  id: string
  name: string
  layerType: string
  position: {
    x: number
    y: number
    z?: number
  }
  params: Record<string, any>
  inputSpecs?: TensorSpec[]
  outputSpecs?: TensorSpec[]
}

export type GraphEdge = {
  id: string
  fromNodeId: string
  fromPort: string
  toNodeId: string
  toPort: string
}

export type NeuralGraph = {
  version: number
  framework: "pytorch"
  nodes: LayerNode[]
  edges: GraphEdge[]
}
```

## 要完成的功能

```txt
1. 新建节点
2. 删除节点
3. 移动节点
4. 创建连接
5. 删除连接
6. 内存中维护 graph
```

## 验收标准

你能构造出：

```txt
Input -> Conv2d -> ReLU -> MaxPool2d -> Flatten -> Linear
```

并且保存成 JSON。

---

# 第 2 阶段：Layer Registry 层注册系统

## 目标

不要把 Conv2d、Linear 写死在 UI 里。
你要做一个注册表。

```ts
export type ParamDef = {
  name: string
  type: "number" | "string" | "boolean" | "select" | "tuple"
  default: any
  required?: boolean
  options?: string[]
  min?: number
  max?: number
}

export type PortDef = {
  name: string
  tensorRank?: number
}

export type LayerTypeDef = {
  type: string
  label: string
  category:
    | "input"
    | "conv"
    | "norm"
    | "activation"
    | "pool"
    | "reshape"
    | "linear"
    | "merge"
    | "output"

  inputs: PortDef[]
  outputs: PortDef[]
  params: ParamDef[]
}
```

## 第一批支持节点

第一版只做这些：

```txt
Input
Conv2d
BatchNorm2d
ReLU
MaxPool2d
AdaptiveAvgPool2d
Flatten
Linear
Dropout
Add
Concat
Output
```

这 12 个够了。

不要一开始做 Transformer。
不要一开始做 Attention。
不要一开始做 LSTM。
否则你会在第一阶段就死掉。

---

# 第 3 阶段：Shape 推导系统

这是整个项目的灵魂。

## 目标

用户一连线，系统就自动算出：

```txt
Input: [B, 3, 224, 224]
Conv2d 输出: [B, 32, 224, 224]
MaxPool 输出: [B, 32, 112, 112]
Flatten 输出: [B, 401408]
Linear 输出: [B, 10]
```

## 你需要写这些推导函数

```txt
inferInput
inferConv2d
inferBatchNorm2d
inferReLU
inferMaxPool2d
inferAdaptiveAvgPool2d
inferFlatten
inferLinear
inferAdd
inferConcat
```

## Conv2d 推导

```ts
function inferConv2d(input: TensorSpec, params: any): TensorSpec {
  const [B, C, H, W] = input.shape

  if (input.shape.length !== 4) {
    throw new Error("Conv2d 需要 4D Tensor: [B, C, H, W]")
  }

  if (C !== params.in_channels) {
    throw new Error(`Conv2d 输入通道不匹配: 需要 ${params.in_channels}, 实际 ${C}`)
  }

  const kernel = params.kernel_size[0]
  const stride = params.stride[0]
  const padding = params.padding[0]
  const dilation = params.dilation ?? 1

  const outH =
    typeof H === "number"
      ? Math.floor((H + 2 * padding - dilation * (kernel - 1) - 1) / stride + 1)
      : null

  const outW =
    typeof W === "number"
      ? Math.floor((W + 2 * padding - dilation * (kernel - 1) - 1) / stride + 1)
      : null

  return {
    dtype: input.dtype,
    shape: [B, params.out_channels, outH, outW]
  }
}
```

## Flatten 推导

```ts
function inferFlatten(input: TensorSpec, params: any): TensorSpec {
  const [B, ...rest] = input.shape

  let features: number | null = 1

  for (const dim of rest) {
    if (typeof dim !== "number") {
      features = null
      break
    }
    features *= dim
  }

  return {
    dtype: input.dtype,
    shape: [B, features]
  }
}
```

## Linear 推导

```ts
function inferLinear(input: TensorSpec, params: any): TensorSpec {
  if (input.shape.length !== 2) {
    throw new Error("Linear 需要 2D Tensor: [B, features]")
  }

  const [B, features] = input.shape

  if (features !== params.in_features) {
    throw new Error(`Linear 输入特征不匹配: 需要 ${params.in_features}, 实际 ${features}`)
  }

  return {
    dtype: input.dtype,
    shape: [B, params.out_features]
  }
}
```

## 验收标准

连接错误要能被发现：

```txt
Conv2d -> Linear
```

提示：

```txt
Linear 需要 2D Tensor，但 Conv2d 输出是 4D Tensor，请插入 Flatten 或 AdaptiveAvgPool2d。
```

---

# 第 4 阶段：参数编辑器

## 目标

用户点击节点，右侧出现参数面板。

例如 Conv2d：

```txt
name: conv1
in_channels: 3
out_channels: 32
kernel_size: [3, 3]
stride: [1, 1]
padding: [1, 1]
bias: true
```

## 关键点

参数编辑器不能手写死。
应该根据 `LayerTypeDef.params` 自动生成表单。

```ts
function renderParamInput(param: ParamDef, value: any) {
  switch (param.type) {
    case "number":
      return <NumberInput />
    case "boolean":
      return <Checkbox />
    case "select":
      return <Select />
    case "tuple":
      return <TupleInput />
    default:
      return <TextInput />
  }
}
```

## 验收标准

你新增一个节点类型时，不需要改 UI。
只要改 Layer Registry，UI 自动出现对应参数。

---

# 第 5 阶段：PyTorch 代码生成

## 目标

把图导出成：

```python
import torch
import torch.nn as nn

class GeneratedNet(nn.Module):
    def __init__(self):
        super().__init__()
        ...

    def forward(self, x):
        ...
```

## 第一版只支持单链路

也就是：

```txt
Input -> Conv2d -> ReLU -> Pool -> Flatten -> Linear -> Output
```

生成：

```python
class GeneratedNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.conv1 = nn.Conv2d(3, 32, 3, 1, 1)
        self.relu1 = nn.ReLU(inplace=True)
        self.pool1 = nn.MaxPool2d(2, 2)
        self.flatten = nn.Flatten(start_dim=1)
        self.fc = nn.Linear(401408, 10)

    def forward(self, x):
        x = self.conv1(x)
        x = self.relu1(x)
        x = self.pool1(x)
        x = self.flatten(x)
        x = self.fc(x)
        return x
```

## 第二版再支持分支

比如 ResNet：

```txt
x -> conv1 -> bn1 -> relu -> conv2 -> bn2
 \____________________________________ Add -> relu
```

这个时候要生成变量：

```python
identity = x
out = self.conv1(x)
out = self.bn1(out)
out = self.relu(out)
out = self.conv2(out)
out = self.bn2(out)
out = out + identity
out = self.relu2(out)
```

## 验收标准

导出的代码可以直接运行：

```python
model = GeneratedNet()
x = torch.randn(1, 3, 224, 224)
y = model(x)
print(y.shape)
```

---

# 第 6 阶段：Validator 错误校验系统

## 要检查的问题

```txt
1. 是否有孤立节点
2. 是否有多个 Input
3. 是否没有 Output
4. 是否存在环
5. 是否 Tensor rank 不匹配
6. 是否 Conv2d in_channels 错误
7. 是否 Linear in_features 错误
8. Add 两边 shape 是否一致
9. Concat 除拼接维度外 shape 是否一致
10. 是否有节点参数缺失
```

## 错误等级

```ts
type GraphIssue = {
  level: "error" | "warning" | "info"
  nodeId?: string
  edgeId?: string
  message: string
}
```

## 示例

```txt
error:
Linear 输入特征不匹配，期望 128，实际 401408。

warning:
Flatten 后特征数过大，建议使用 AdaptiveAvgPool2d 降维。

info:
当前网络参数量约 12.3M。
```

这个东西会让你的编辑器从玩具变工具。

---

# 第 7 阶段：保存、加载、模板

## 保存格式

```json
{
  "version": 1,
  "framework": "pytorch",
  "nodes": [],
  "edges": []
}
```

## 内置模板

第一批模板：

```txt
Simple CNN
Mini VGG
Mini ResNet Block
UNet Mini
MLP
```

## 验收标准

用户可以：

```txt
打开模板 -> 修改节点 -> 重新推导 shape -> 导出 PyTorch
```

---

# 第 8 阶段：3D 可视化

这时候再做 3D。

## 3D 布局建议

```txt
X轴：网络执行顺序
Y轴：分支高度
Z轴：网络模块区域
```

例如：

```txt
Z = 0: Backbone
Z = 1: Neck
Z = 2: Head
```

适合可视化：

```txt
YOLO
UNet
ResNet
多模态网络
```

## 3D 节点显示

每个节点显示：

```txt
Conv2d
conv1
[B, 3, 224, 224] -> [B, 32, 224, 224]
k=3 s=1 p=1
```

## 3D 连接线显示

连接线显示：

```txt
float32 [B, 32, 224, 224]
```

错误连接变红。

## 注意

3D 是展示层，不是核心层。

不要让 Three.js 直接修改 graph 数据。
Three.js 只负责显示，真正状态在 GraphCore。

---

# 推荐项目目录

```txt
nn-graph-editor/
  src/
    core/
      graph/
        types.ts
        graphStore.ts
        graphUtils.ts

      registry/
        LayerRegistry.ts
        layers/
          Input.ts
          Conv2d.ts
          BatchNorm2d.ts
          ReLU.ts
          MaxPool2d.ts
          AdaptiveAvgPool2d.ts
          Flatten.ts
          Linear.ts
          Add.ts
          Concat.ts
          Output.ts

      shape/
        inferShape.ts
        inferConv2d.ts
        inferPool.ts
        inferFlatten.ts
        inferLinear.ts

      validate/
        validateGraph.ts
        validateConnection.ts

      codegen/
        generatePyTorch.ts
        generateForward.ts
        generateInit.ts

      serialize/
        saveGraph.ts
        loadGraph.ts

    editor/
      GraphCanvas.tsx
      NodeView.tsx
      EdgeView.tsx
      Toolbar.tsx
      Inspector.tsx
      LayerPalette.tsx
      ErrorPanel.tsx

    three/
      SceneView.tsx
      NodeMesh.tsx
      EdgeMesh.tsx
      Layout3D.ts

    examples/
      simpleCnn.ts
      miniResnet.ts
```

---

# 具体开发顺序

## 第 1 周：图编辑基础

```txt
Day 1:
- 建项目
- 定义 GraphData / Node / Edge 类型

Day 2:
- 新建节点
- 删除节点
- 移动节点

Day 3:
- 创建连接
- 删除连接

Day 4:
- 保存 JSON
- 加载 JSON

Day 5:
- 做一个 Simple CNN 示例图
```

第一周结束，你应该有一个“能画网络结构”的编辑器。

---

## 第 2 周：层系统 + 参数面板

```txt
Day 1:
- LayerTypeDef
- LayerRegistry

Day 2:
- Input / Conv2d / ReLU / Linear

Day 3:
- Pool / Flatten / BatchNorm

Day 4:
- 参数面板自动生成

Day 5:
- 修改参数后更新节点
```

第二周结束，你的节点不再只是“方块”，而是有真实神经网络语义。

---

## 第 3 周：Shape 推导

```txt
Day 1:
- 拓扑排序

Day 2:
- Input / Conv2d shape 推导

Day 3:
- Pool / Flatten / Linear shape 推导

Day 4:
- Add / Concat shape 推导

Day 5:
- UI 显示输入输出 shape
```

第三周结束，你的编辑器开始变成真正工具。

---

## 第 4 周：错误校验 + 代码生成

```txt
Day 1:
- 连接合法性检查

Day 2:
- 参数合法性检查

Day 3:
- 生成 __init__

Day 4:
- 生成 forward

Day 5:
- 导出完整 PyTorch 文件
```

第四周结束，你就有一个 MVP。

---

# MVP 最终验收

你的第一版必须做到：

```txt
1. 可以拖出 Input / Conv2d / ReLU / Pool / Flatten / Linear
2. 可以连线
3. 可以编辑参数
4. 可以自动推导 shape
5. 可以提示错误连接
6. 可以保存 / 加载 JSON
7. 可以导出 PyTorch 代码
8. 导出的代码能跑通 torch.randn 测试
```

只要这 8 个完成，你这个项目就不是玩具。

---

# 后续增强功能

MVP 完成后再加：

```txt
1. 参数量统计
2. FLOPs 估算
3. receptive field 感受野估算
4. 自动插入 Flatten
5. 自动修正 Linear.in_features
6. ONNX 导出
7. 模型可视化预览
8. 支持 ResNet Block
9. 支持 UNet Block
10. 支持 Transformer Block
11. 支持训练脚本生成
12. 支持导入 PyTorch 代码反向生成图
```

其中最有价值的是：

```txt
自动修正 Linear.in_features
参数量统计
FLOPs 估算
ResNet Block 模板
UNet 模板
```

---

# 最大风险

## 1. 你太早做 3D

这是最大坑。

你会花很多时间做：

```txt
相机控制
节点遮挡
射线检测
拖拽
连线
空间布局
```

最后核心 shape 推导没做出来。

结论：

```txt
先 2D，后 3D。
```

---

## 2. 你太早支持复杂网络

一开始不要碰：

```txt
Transformer
Attention
LSTM
动态图
条件分支
循环结构
```

先把 CNN 图跑通。

---

## 3. 你没有 shape 系统

没有 shape 系统，这项目价值很低。

用户自己连线，最后导出代码报错，那你的编辑器没有意义。

---

## 4. 你没有代码生成

只保存 JSON 不够。
必须能生成 PyTorch。

你的工具最终价值是：

```txt
设计结构 -> 生成代码 -> 训练验证
```

---

# 你现在最应该马上做的 5 件事

```txt
1. 建 React + TypeScript 项目
2. 写 GraphData 类型
3. 写 LayerRegistry
4. 写 Conv2d / Linear / Flatten 的 shape 推导
5. 写 PyTorch codegen 的最小版本
```

别先开 Three.js。
别先做漂亮 UI。
别先搞复杂网络。

真正的第一目标是：

```txt
Input -> Conv2d -> ReLU -> Flatten -> Linear
```

能自动推导 shape，并导出可运行 PyTorch。
做到这个，你再往上加东西才有意义。
