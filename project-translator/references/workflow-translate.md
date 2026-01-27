# 翻译文件流程

## 概述

按照 `<项目根目录>/.todo/project-translation-task.md` 中的清单，对每个文件执行以下步骤。

## 1. 读取文件预览

调用 `node scripts/read-file.js` 读取文件前 20 行，判断是否已翻译：
```bash
node scripts/read-file.js --file-path <文件绝对路径> --max-lines 20
```

如果前 20 行已包含中文，且内容完整，可判断为已翻译，跳过该文件。

## 2. 执行翻译

### 2.1 加载术语表

调用 `node scripts/load-glossary.js --file-path <文件绝对路径>` 加载相关的术语表：
```bash
node scripts/load-glossary.js --file-path <文件绝对路径>
```

该脚本会：
- 根据文件路径和文件名判断所属领域
- 从 `references/glossary.md` 读取可用术语表列表
- 加载对应的术语表文件（支持 TOML 和 CSV 格式）
- 输出格式化的术语表规则供智能体参考

术语表支持两种规则类型：
- **保留原文**：指定术语在特定领域不翻译，保留英文原文
- **强制翻译**：指定术语必须翻译为指定的中文表达

术语表格式：
- **TOML 格式**：结构化格式，适合复杂术语表
- **CSV 格式**：简洁格式，减少 token 消耗

术语表按领域组织，位于 `references/glossary/` 目录，在 `references/glossary.md` 中按领域暴露。

### 2.2 读取并翻译

对于需要翻译的文件：
- 读取完整文件内容
- 根据术语表规则处理术语
  - 保留原文不翻译的术语，保持英文
  - 强制翻译的术语，使用指定的中文表达
- 翻译所有其他英文内容为中文
- 保留代码格式、Markdown 格式、注释结构不变

翻译完成后，调用 `node scripts/write-file.js` 覆盖原文件：
```bash
node scripts/write-file.js --file-path <文件绝对路径> --content <翻译后的内容>
```

## 3. 更新任务进度

每次完成一个文件翻译后，调用 `node scripts/update-todo.js` 更新 `<项目根目录>/.todo/project-translation-task.md` 中的进度标记：
```bash
node scripts/update-todo.js --project-path <项目绝对路径> --file-path <文件绝对路径> --status completed
```

该脚本会在对应的文件路径前添加 `[x]` 标记，表示已完成。
