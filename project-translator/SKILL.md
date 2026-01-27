---
name: project-translator
description: 项目翻译，翻译文档和代码文件，支持批量翻译
dependency:
  system:
    - npm install
---

# 项目翻译助手

## 任务目标

- **用途**：批量翻译项目中的文档和代码文件为中文
- **能力**：自动扫描待翻译文件、生成任务清单、逐个翻译并追踪进度、覆盖式翻译、Git 冲突处理、术语表支持
- **触发条件**：用户需要将项目文档或代码翻译成中文；Git pull 后需要重新翻译被更新的文件

## 前置准备

- NodeJS 环境
- Git 环境（用于冲突检测和版本恢复）
- 配置文件（可选）：在项目根目录创建 `configs/setting.json` 覆盖默认配置

## 配置说明

### 默认配置

Skill 提供默认配置 `configs/setting.json`，包含：
- `targetLanguage`: 目标语言（默认：中文）
- `taskTrackingFile`: 任务跟踪文件路径（默认：`.todo/project-translation-task.md`）
- `fileFilters`: 文件过滤规则
- `translation`: 翻译设置
- `experiment`: 实验性功能
  - `translateFromDiff`: 智能差异翻译（默认：`false`）- 开启后，Git 冲突处理时基于 diff 进行增量翻译而非重新翻译整个文档

### 项目配置

在项目根目录创建 `configs/setting.json` 可覆盖默认配置：
```json
{
  "targetLanguage": "中文",
  "taskTrackingFile": ".todo/project-translation-task.md",
  "experiment": {
    "translateFromDiff": true
  }
}
```

### 加载配置

调用 `node scripts/load-config.js --project-path <项目绝对路径>` 查看当前配置：
```bash
node scripts/load-config.js --project-path <项目绝对路径>
```

所有脚本会自动加载配置（优先项目配置，其次默认配置）。

### 添加自定义术语表

详见 [添加自定义术语表](references/workflow-add-glossary.md)

### 智能差异翻译（实验性）

当 `experiment.translateFromDiff` 开启时，Git 冲突处理会使用智能差异翻译模式：

1. 生成 diff 和上下文：调用 `scripts/generate-diff.js` 获取变更内容及上下文（前后200字符）
2. 语义化补全：智能体根据 diff 和上下文，翻译变更内容并更新已翻译文档
3. 保留已有翻译：仅处理上游变更部分，避免重复翻译

详见 [智能差异翻译流程](references/workflow-diff-translate.md)

## 操作流程

### 1. 扫描项目生成任务清单

详见 [扫描项目生成任务清单](references/workflow-scan.md)

```bash
node scripts/scan-files.js --project-path <项目绝对路径>
```

### 2. 逐个翻译文件

详见 [翻译文件流程](references/workflow-translate.md)

按照 [翻译优先级规则](references/translation-priority.md) 选择文件，对每个文件执行：
- 读取预览 → 判断是否已翻译
- 加载术语表（详见 [术语表使用说明](references/glossary-usage.md)）
- 执行翻译
- 更新进度

### 3. Git 冲突处理（可选）

详见 [Git 冲突处理流程](references/workflow-git-conflicts.md)

在 `git pull` 后，检测并处理被上游更新的文件：

- **常规模式**（`experiment.translateFromDiff: false`）：恢复上游版本，重新翻译整个文件
- **智能模式**（`experiment.translateFromDiff: true`）：生成 diff，根据差异和上下文进行语义化补全，保留已有翻译

### 4. 完成通知

当 `<项目根目录>/.todo/project-translation-task.md` 中所有任务都标记为 `[x]` 后，通知用户翻译完成。

## 资源索引

### 必要脚本

- [scripts/load-config.js](scripts/load-config.js) - 加载配置文件
- [scripts/scan-files.js](scripts/scan-files.js) - 扫描项目生成待翻译清单
- [scripts/read-file.js](scripts/read-file.js) - 读取文件内容（支持行数限制）
- [scripts/write-file.js](scripts/write-file.js) - 写入文件内容（覆盖模式）
- [scripts/update-todo.js](scripts/update-todo.js) - 更新待翻译任务清单中的进度标记
- [scripts/check-git-conflicts.js](scripts/check-git-conflicts.js) - 检测Git pull后被更新的已翻译文件
- [scripts/restore-upstream-version.js](scripts/restore-upstream-version.js) - 恢复文件为上游版本
- [scripts/load-glossary.js](scripts/load-glossary.js) - 根据文件路径加载相关术语表
- [scripts/link-glossary.js](scripts/link-glossary.js) - 链接用户提供的术语表文件到 references/glossary/
- [scripts/generate-diff.js](scripts/generate-diff.js) - 生成文件 diff 并提取上下文（用于智能差异翻译）

### 配置文件

- [configs/setting.json](configs/setting.json) - 默认配置文件
  - `targetLanguage`: 目标语言（默认：中文）
  - `taskTrackingFile`: 任务跟踪文件路径
  - `fileFilters`: 文件过滤规则
  - `fileFilters.ignoreGitignore`: 是否使用 .gitignore 过滤文件（默认：true）
  - `translation`: 翻译设置
  - `experiment`: 实验性功能
    - `translateFromDiff`: 智能差异翻译（默认：false）

### 术语表

- [references/glossary.md](references/glossary.md) - 术语表索引，按领域暴露可用术语表
- [references/glossary/agent.skill.toml](references/glossary/agent.skill.toml) - 智能体领域术语表（TOML 格式）
- [references/glossary/programming.csv](references/glossary/programming.csv) - 编程领域术语表（CSV 格式）

### 流程参考

- [references/workflow-scan.md](references/workflow-scan.md) - 扫描项目生成任务清单流程
- [references/workflow-translate.md](references/workflow-translate.md) - 翻译文件详细流程
- [references/workflow-add-glossary.md](references/workflow-add-glossary.md) - 添加自定义术语表流程
- [references/workflow-git-conflicts.md](references/workflow-git-conflicts.md) - Git 冲突处理流程
- [references/workflow-diff-translate.md](references/workflow-diff-translate.md) - 智能差异翻译流程（实验性）
- [references/translation-priority.md](references/translation-priority.md) - 翻译优先级规则
- [references/glossary-usage.md](references/glossary-usage.md) - 术语表使用说明

## 注意事项

- 翻译前务必确认文件是否已翻译，避免重复劳动
- **配置优先级**：项目配置 > 默认配置
- **翻译优先级**：按照 [翻译优先级规则](references/translation-priority.md) 选择文件
- **术语表规则**：翻译前加载相关术语表，确保术语翻译的一致性和准确性（详见 [术语表使用说明](references/glossary-usage.md)）
- 翻译代码文件时，保留代码逻辑和结构，仅翻译注释和文档字符串
- 翻译 Markdown 文件时，保留格式、链接和代码块
- 每个文件翻译完成后立即更新任务清单，便于追踪进度
- 遇到无法翻译的文件（如二进制文件），在任务清单中手动添加注释
- 任务清单默认保存在 `<项目根目录>/.todo/project-translation-task.md`，可通过配置修改
- Git 冲突处理时，恢复上游版本会覆盖本地翻译，确保基于最新源码重新翻译

## 使用示例

### 示例 1：翻译新项目

```bash
# 步骤1: 生成待翻译清单
node scripts/scan-files.js --project-path <项目绝对路径>

# 步骤2: 逐个翻译文件（按优先级）
# 对每个文件执行：读取预览 → 判断 → 翻译 → 写入 → 更新进度

# 步骤3: 完成后通知用户
```

### 示例 2：继续未完成的翻译

```bash
# 直接读取现有任务清单 <项目根目录>/.todo/project-translation-task.md
# 如果任务清单缺失，尝试重新生成
# 找到未标记[x]的文件，继续执行翻译步骤
```

### 示例 3：处理 Git 更新冲突（常规模式）

```bash
# 步骤1: 用户执行 git pull
git pull origin main

# 步骤2: 检测被更新的已翻译文件
node scripts/check-git-conflicts.js --project-path <项目绝对路径>

# 步骤3: 对每个被更新的文件：
# 3.1 恢复上游版本
node scripts/restore-upstream-version.js --project-path <项目绝对路径> --file-path <文件路径>

# 3.2 标记为待翻译
node scripts/update-todo.js --project-path <项目绝对路径> --file-path <文件路径> --status pending

# 3.3 重新翻译（执行翻译文件流程）
```

### 示例 4：处理 Git 更新冲突（智能差异翻译模式）

```bash
# 步骤1: 开启智能差异翻译
# 在 configs/setting.json 中设置 "experiment.translateFromDiff": true

# 步骤2: 用户执行 git pull
git pull origin main

# 步骤3: 检测被更新的已翻译文件
node scripts/check-git-conflicts.js --project-path <项目绝对路径>

# 步骤4: 对每个被更新的文件，执行智能差异翻译：
# 4.1 生成 diff 和上下文
node scripts/generate-diff.js --project-path <项目绝对路径> --file-path <文件路径>

# 4.2 智能体根据 diff 和上下文进行语义化补全
# - 阅读已翻译的文件内容
# - 根据 diff 中的变更和上下文，翻译新增/修改的内容
# - 保持已有翻译不变，仅更新变更部分
# - 调用 node scripts/write-file.js 写入更新后的内容

# 4.3 更新进度
node scripts/update-todo.js --project-path <项目绝对路径> --file-path <文件路径> --status completed
```
