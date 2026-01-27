# 添加自定义术语表

## 概述

为特定领域或项目添加自定义术语表，确保翻译时术语的一致性和准确性。

## 操作步骤

### 方法一：自动链接术语表（推荐）

调用 `node scripts/link-glossary.js` 自动链接并注册术语表：

```bash
node scripts/link-glossary.js --file-path <术语表文件路径>
```

该脚本会：
- 校验术语表文件格式（CSV 或 TOML）
- 使用符号链接将文件链接到 `references/glossary/` 目录
- 自动更新 `references/glossary.md` 添加术语表引用

**示例**：
```bash
node scripts/link-glossary.js --file-path /path/to/frontend-terms.csv
```

### 方法二：手动添加

如需手动添加自定义术语表：

1. 在 `references/glossary/` 目录下创建新文件
2. 选择 TOML 或 CSV 格式
3. 文件命名格式：`<domain>.<ext>`（如 `frontend.toml`）
4. 在 [references/glossary.md](references/glossary.md) 中添加术语表说明

## 术语表格式

### TOML 格式

适合结构化、复杂的术语表：

```toml
# frontend.toml

[[rules]]
term = "component"
action = "translate"
translation = "组件"
reason = "component 翻译为组件"

[[rules]]
term = "hook"
action = "keep"
translation = "hook"
reason = "hook 保留原文"
```

### CSV 格式

适合简洁、高效的术语表（减少 token 消耗）：

```csv
term,action,translation,reason
component,translate,组件,component 翻译为组件
hook,keep,,
```

**CSV 字段说明**：
- `term`: 术语（必填）
- `action`: 规则类型（必填，`keep` 保留原文 / `translate` 强制翻译）
- `translation`: 翻译结果（`action=translate` 时必填，`action=keep` 时可留空）
- `reason`: 翻译说明（可选）

## 更新术语表索引

在 [references/glossary.md](references/glossary.md) 中添加术语表说明：

```markdown
- 前端领域: `glossary/frontend.toml` (TOML) | 前端领域的术语表，触发条件: 文件路径包含 "src"、"components"、"ui" 等关键词
```

## 使用自定义术语表

术语表加载逻辑（由 `node scripts/load-glossary.js` 自动处理）：

1. 根据当前翻译文件的路径和文件名判断所属领域
2. 从 [references/glossary.md](references/glossary.md) 读取可用术语表列表
3. 根据触发条件匹配对应的术语表
4. 加载术语表文件并输出格式化的规则供智能体参考

## 触发条件示例

- **文件路径关键词**: 文件路径包含特定关键词（如 "agent"、"skill"、"src"）
- **文件名匹配**: 文件名包含领域名称（如 "frontend"）
- **精确匹配**: 文件路径精确匹配指定路径

## 注意事项

- 术语表文件必须使用 CSV 或 TOML 格式
- 文件命名建议使用领域名称（如 `agent.skill.toml`、`programming.csv`）
- 触发条件应尽可能准确，避免误匹配
- 术语表更新后无需额外操作，下次翻译时自动生效
