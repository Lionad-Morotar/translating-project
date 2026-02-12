---
name: tp:config
description: 读取项目配置
argument-hint: "<subcommand> -w <path> [options]"
allowed-tools: [Bash]
---

<objective>
加载并返回合并后的项目配置。
</objective>

<required_context>

## 配置系统

配置使用三层合并机制：

1. **默认配置**：`~/.claude/skills/translating-project/configs/setting.json`
2. **个人配置**：`~/.tp/config.json`
3. **项目配置**：`{project}/.tp/config.json`（优先级最高）

</required_context>

<process>
识别用户意图，执行以下脚本，完成配置相关操作。

```bash
node ~/.claude/skills/translating-project/tools/tp.js config {subcommand} -w {待翻译项目根目录} [options]
```

**子命令**：
- `get [key]` - 获取配置值（支持嵌套 key，如 `fileFilters.ignoreGitignore`）
- `set <key> <value>` - 设置配置值
- `list` - 列出配置

**必填选项**：
- `-w, --working-dir <path>` - 指定工作目录（自动定位到 Git 仓库根目录）

**可选选项**（互斥）：
- `-p, --project` - 仅使用项目配置
- `-g, --global` - 仅使用个人配置
- `-d, --default` - 仅使用默认配置

**说明**：
- 不指定 `-p/-g/-d` 时，合并三层配置（项目 > 个人 > 默认）
- `set` 不能配合 `-d` 使用（默认配置只读）

**示例**：
```bash
# 获取合并配置
node ~/.claude/skills/translating-project/tools/tp.js config list -w {待翻译项目根目录}

# 获取个人配置
node ~/.claude/skills/translating-project/tools/tp.js config get targetLanguage -w {待翻译项目根目录} -g

# 设置项目配置
node ~/.claude/skills/translating-project/tools/tp.js config set targetLanguage "中文" -w {待翻译项目根目录}
```
</process>
