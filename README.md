# NNMind

一个面向 PyTorch 的可视化神经网络结构编辑器 MVP。

当前这版已经具备第一阶段到第四阶段的主骨架：

- React Flow 画布，支持节点拖拽和连线
- Layer Registry，节点类型和参数表单自动生成
- Tensor shape 推导
- 图校验和错误提示
- Graph JSON 保存/导入
- 单主链路 PyTorch 代码导出

## 快速启动

```bash
npm install
npm run dev
```

默认本地地址：

```bash
http://127.0.0.1:5173/
```

## 当前示例

页面默认加载一条 `Simple CNN`：

```txt
Input -> Conv2d -> ReLU -> MaxPool2d -> Flatten -> Linear -> Output
```

它会自动推导：

```txt
[B, 3, 224, 224]
-> [B, 32, 224, 224]
-> [B, 32, 112, 112]
-> [B, 401408]
-> [B, 10]
```

## 目录结构

```txt
src/
  core/
    codegen/
    graph/
    registry/
    serialize/
    shape/
    validate/
  editor/
  examples/
```

## 下一步建议

1. 给连线增加更严格的输入/输出合法性检查
2. 增加删除节点、删除边、重命名图模板
3. 把 `Add / Concat` 的分支 codegen 做完整
4. 增加本地持久化和文件下载导入
5. 再考虑 3D 展示层
