# 术语表使用说明

## 概述

术语表用于确保术语翻译的一致性和准确性，支持保留原文或强制翻译特定术语。

## 加载术语表

调用 `node scripts/load-glossary.js --file-path <文件绝对路径>` 加载相关的术语表：
```bash
node scripts/load-glossary.js --file-path <文件绝对路径>
```

## 术语表索引

从 `references/glossary.md` 读取按领域暴露的术语表列表，该文件包含：
- 每个术语表的文件名
- 术语表格式（TOML 或 CSV）
- 术语表描述
- 触发条件（关键词）

## 术语表格式

### TOML 格式

结构化格式，适合复杂术语表，易于维护。

```toml
domain = "agent"
description = "智能体领域的术语表"

[[rules]]
term = "skill"
translation = "skill"
action = "keep"
reason = "在智能体领域，skill 是核心概念，保留英文术语"
```

### CSV 格式

简洁格式，减少 token 消耗。

```csv
term,action,translation,reason
bug,translate,缺陷,bug 翻译为缺陷
commit,translate,提交,commit 翻译为提交
```

## 术语规则类型

### 保留原文（keep）

指定术语在特定领域不翻译，保留英文原文。

```toml
[[rules]]
term = "skill"
action = "keep"
translation = "skill"
reason = "在智能体领域，skill 是核心概念，保留英文术语"
```

### 强制翻译（translate）

指定术语必须翻译为指定的中文表达。

```toml
[[rules]]
term = "agent"
action = "translate"
translation = "智能体"
reason = "agent 翻译为智能体"
```

## 术语表匹配

脚本会根据文件路径和文件名判断所属领域，自动加载对应的术语表：

1. 读取 `references/glossary.md` 中的术语表列表
2. 根据文件路径中的关键词匹配领域
3. 加载匹配的术语表文件
4. 输出格式化的术语规则供智能体参考

## 自定义术语表

如需添加自定义术语表：

1. 在 `references/glossary/` 目录下创建新文件
2. 选择 TOML 或 CSV 格式
3. 文件命名格式：`<domain>.<ext>`（如 `frontend.toml`）
4. 在 `references/glossary.md` 中添加术语表说明
