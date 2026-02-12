---
name: translating-project
description: Project Translator Skill - Batch translate project docs and codes，包括管理术语表等功能。
argument-hint: "<command> [args]"
disable-model-invocation: false
user-invocable: true
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task]
version: 0.2.0
dependency:
  system:
    - npm install
---

## 上下文说明

## 上下文说明

- {tp-skill}：指项目翻译助手（即本技能）
- 上游：指待翻译项目的 upstream/main
- 任务清单：`{待翻译项目根目录}/.todo/tp-task.md`
- 差异清单：`{待翻译项目根目录}/.todo/tp-diff-task.md`
- 查找暂存区：指执行指令 `git status --porcelain`
- 文件路径：永远使用绝对路径

## 执行

识别用户意图，匹配以下一项任务并执行。

| Command | Description | How to Use |
|---------|-------------|------------------|
| scan | 查找项目内未翻译文件，或"更新任务清单" | 执行[./commands/tp/scan.md](./commands/tp/scan.md) |
| translate | 翻译项目（当用户没有明确要翻译什么时，选这个） | 执行[./commands/tp/translate.md](./commands/tp/translate.md) |
| update | 同步上游更新并翻译差异 | 执行[./commands/tp/update.md](./commands/tp/update.md) |
| glossary | 术语表任务，如添加自定义术语 | 执行[./commands/tp/glossary.md](./commands/tp/glossary.md) |
| config | 读取项目配置 | 执行[./commands/tp/config.md](./commands/tp/config.md) |
| help | 显示帮助 | 执行[./commands/tp/help.md](./commands/tp/help.md) |

## 资源索引

| 资源类型 | 路径 |
|---------|------|
| 任务或指令 | [./commands/tp/](./commands/tp/) |
| 子代理 | [./agents/](./agents/) |
| 工具函数（一般情况不会用到） | [./tools/](./tools/) |
| 资源 | [./assets/](./assets/) |
| 默认配置 | [./configs/](./configs/) |
| 模版文件 | [./templates/](./templates/) |
