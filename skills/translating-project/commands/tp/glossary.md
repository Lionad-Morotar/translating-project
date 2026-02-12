---
name: tp:glossary
description: 管理翻译术语表
argument-hint: "<subcommand> -w <path> [options]"
allowed-tools: [Read, Write, Bash]
---

<objective>
管理项目翻译术语表。
</objective>

<required_context>

## 术语表系统

术语表使用三层合并机制：

1. **默认术语表**：`~/.claude/skills/translating-project/assets/glossary/`
2. **个人术语表**：`~/.tp/glossary/`
3. **项目术语表**：`{project}/.tp/glossary/`（优先级最高）

</required_context>

<process>

```bash
node ~/.claude/skills/translating-project/tools/tp.js glossary {subcommand} -w {待翻译项目根目录} [options]
```

**子命令**：
- `add <file>` - 添加术语表文件
- `list` - 列出所有术语表
- `show <name>` - 查看术语表内容
- `remove <name>` - 删除术语表

**必填选项**：
- `-w, --working-dir <path>` - 指定工作目录（自动定位到 Git 仓库根目录）

**可选选项**（互斥）：
- `-p, --project` - 仅使用项目术语表
- `-g, --global` - 仅使用个人术语表
- `-d, --default` - 仅使用默认术语表

**说明**：
- 不指定 `-p/-g/-d` 时，显示所有层级术语表
- `add/remove` 不能配合 `-d` 使用（默认术语表只读）

**示例**：
```bash
# 列出所有术语表
node ~/.claude/skills/translating-project/tools/tp.js glossary list -w {待翻译项目根目录}

# 查看术语表
node ~/.claude/skills/translating-project/tools/tp.js glossary show agent -w {待翻译项目根目录}

# 添加术语表到个人
node ~/.claude/skills/translating-project/tools/tp.js glossary add ./terms.csv -w {待翻译项目根目录} -g
```

</process>

<output>
- add：添加成功确认
- list：术语表列表
- show：术语表内容
- remove：删除成功确认
</output>

<success_criteria>
- [ ] 成功操作术语表
- [ ] 文件格式正确（CSV 或 TOML）
</success_criteria>
