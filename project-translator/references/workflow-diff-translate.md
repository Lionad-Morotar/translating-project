# 智能差异翻译流程

## 概述

智能差异翻译（实验性功能）是一种增量翻译方式，用于处理 Git 上游更新后的文件翻译。与常规模式的"恢复上游版本 + 重新翻译"不同，智能差异翻译通过分析 diff 和上下文，仅翻译变更部分，保留已有的翻译内容。

## 前置条件

- 配置 `experiment.translateFromDiff` 为 `true`
- 文件已进行过翻译
- 上游有新的变更（通过 `git pull` 更新）

## 操作步骤

### 1. 生成 diff 和上下文

调用 `scripts/generate-diff.js` 获取文件的变更信息：

```bash
node scripts/generate-diff.js --project-path <项目绝对路径> --file-path <文件绝对路径>
```

该脚本会：
- 获取上游版本（HEAD）的原始内容
- 获取本地工作区的已翻译内容
- 生成 git diff
- 对每个变更行，提取原文和译文中的上下文（前后200字符）
- 输出结构化的 diff 数据

**输出示例：**
```json
{
  "status": "success",
  "file": "src/utils.js",
  "changes": [
    {
      "type": "added",
      "file": "src/utils.js",
      "originalLineNumber": 42,
      "translatedLineNumber": 42,
      "content": "新增的代码行内容",
      "originalContext": "...前200字符...",
      "translatedContext": "...前200字符..."
    },
    {
      "type": "removed",
      "file": "src/utils.js",
      "originalLineNumber": 55,
      "translatedLineNumber": 55,
      "content": "被删除的代码行内容",
      "originalContext": "...前200字符...",
      "translatedContext": "...前200字符..."
    }
  ],
  "summary": {
    "totalChanges": 5,
    "removed": 2,
    "added": 3
  }
}
```

### 2. 读取已翻译的文件

调用 `scripts/read-file.js` 读取完整的已翻译文件：

```bash
node scripts/read-file.js --file-path <文件绝对路径>
```

### 3. 加载术语表（可选）

如果需要确保术语翻译的一致性，调用 `scripts/load-glossary.js`：

```bash
node scripts/load-glossary.js --file-path <文件绝对路径>
```

### 4. 语义化补全

智能体根据 diff 和上下文，执行以下操作：

#### 4.1 分析变更

- 阅读 diff 数据，理解上游的变更内容
- 识别新增、修改、删除的代码或文本
- 理解上下文中的翻译风格和术语使用

#### 4.2 翻译变更内容

对每个变更项进行处理：

**新增内容：**
- 阅读原文内容和上下文
- 结合已翻译文件的上下文，翻译新增内容
- 保持翻译风格和术语一致性

**删除内容：**
- 在已翻译文件中找到对应的译文
- 删除该行或相应内容

**修改内容：**
- 对比原文的修改前后
- 更新译文，使其与原文修改保持一致

#### 4.3 生成更新后的内容

- 以已翻译文件为基础
- 应用所有变更（新增、删除、修改）
- 确保文档格式和结构保持完整
- 检查上下文的连贯性

### 5. 写入更新后的文件

调用 `scripts/write-file.js` 写入更新后的内容：

```bash
node scripts/write-file.js --file-path <文件绝对路径> --content <更新后的内容>
```

### 6. 更新任务进度

调用 `scripts/update-todo.js` 标记任务为完成：

```bash
node scripts/update-todo.js --project-path <项目绝对路径> --file-path <文件绝对路径> --status completed
```

## 注意事项

- **上下文理解**：充分利用前后200字符的上下文，理解变更的语义
- **翻译一致性**：保持与已有翻译的风格和术语一致
- **格式保留**：确保 Markdown 格式、代码块、链接等结构完整
- **术语表使用**：在翻译变更内容时，参考术语表确保术语准确性
- **冲突处理**：如果 diff 解析失败或上下文不完整，回退到常规模式（恢复上游版本 + 重新翻译）
- **批量处理**：当多个文件需要更新时，逐个处理，确保每个文件的变更都被正确应用

## 常见问题

### Q: 上下文不足导致翻译不准确怎么办？

A: 如果上下文（前后200字符）不足以理解变更含义，可以：
- 读取完整的已翻译文件
- 读取上游版本的原始文件
- 根据需要扩展上下文范围

### Q: 变更过多导致语义化补全困难怎么办？

A: 如果变更项过多（如超过50个），建议：
- 使用常规模式（恢复上游版本 + 重新翻译）
- 或者分批次处理，每次处理部分变更

### Q: diff 解析失败怎么办？

A: 检查以下事项：
- 文件是否在 Git 仓库中
- 文件是否有未提交的变更
- HEAD 版本和本地版本的差异是否过大

如果无法解决，回退到常规模式处理。

### Q: 更新后发现译文有问题怎么办？

A: 可以手动调整后重新调用 `scripts/write-file.js` 写入，或者使用常规模式重新翻译整个文件。

## 示例

假设上游更新了 `src/utils.js`，新增了一个函数：

**Diff 输出：**
```json
{
  "changes": [
    {
      "type": "added",
      "file": "src/utils.js",
      "originalLineNumber": 42,
      "translatedLineNumber": 42,
      "content": "/**\n * 计算两个数的最大公约数\n * @param {number} a - 第一个数\n * @param {number} b - 第二个数\n * @returns {number} 最大公约数\n */\nexport function gcd(a, b) {\n  while (b !== 0) {\n    [a, b] = [b, a % b];\n  }\n  return a;\n}",
      "originalContext": "function lcm(a, b) {\n  return (a * b) / gcd(a, b);\n}\n",
      "translatedContext": "function lcm(a, b) {\n  return (a * b) / gcd(a, b);\n}\n"
    }
  ]
}
```

**智能体处理：**
1. 读取已翻译的 `src/utils.js`
2. 识别新增的 gcd 函数
3. 翻译注释和文档字符串
4. 保留代码逻辑不变（因为是代码）
5. 将新增的函数插入到正确的位置
6. 保持文件结构完整
7. 写入更新后的文件
