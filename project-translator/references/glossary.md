# 术语表索引

按领域组织的术语表列表，翻译时根据文件路径和文件名选择对应的术语表。

## 可用术语表
- test-no-reason领域: `glossary/test-no-reason.csv` (CSV) | test-no-reason领域的术语表，相关"test-no-reason"等关键词

- 智能体领域: `glossary/agent.skill.toml` 智能体领域的术语表，相关"agent"、"skill"、"智能体"等关键词
- 编程领域: `glossary/programming.csv` 编程领域的通用术语表，相关"src"、"lib"、"app"、"code"等关键词

## 使用说明

### 加载术语表
根据当前翻译文件的路径和文件名，判断所属领域，加载对应的术语表文件。

### 术语规则类型
- **keep**: 保留原文不翻译
- **translate**: 强制翻译为指定中文

### 匹配优先级
1. 精确匹配文件名包含领域名称
2. 模糊匹配文件路径包含领域关键词
3. 默认使用编程领域术语表

## 自定义术语表

如需添加自定义术语表：
1. 在 `references/glossary/` 目录下创建新文件
2. 选择 TOML 或 CSV 格式
3. 文件命名格式：`<domain>.<ext>`（如 `frontend.toml`）
4. 在此文件中添加术语表说明

或告诉 Agent 术语表的路径，Agent 会自动使用 `scripts/link-glossary.js` 链接术语表文件到 `references/glossary/*` 中。