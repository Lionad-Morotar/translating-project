# Project Translator

Or Codebase Translator，项目翻译 Skill，批量翻译项目文档和代码文件为中文。

## 理念

学习新项目时，我希望项目所有资料都是友善且易读的内容。此想法源于简单的原理：尽管语言是习得性技能，但人的非母语阅读效率仍显著低于母语阅读效率。

严肃的翻译仍然需要人工核查以及承担责任，所以此技能————翻译的目的，也是用于学习项目而不是将旧项目分叉（fork）。

## 示例

原项目：todo
新项目：todo

## 核心功能

- **批量翻译**：自动扫描项目，生成待翻译清单，逐个翻译并追踪进度
- **Git 冲突处理**：智能检测上游更新，支持常规重新翻译和实验性差异翻译两种模式
- **优先级管理**：自动优先翻译项目入口文档（README）和核心资料
- **术语表支持**：支持 TOML 和 CSV 格式的术语表，确保术语翻译一致性
- **配置灵活**：支持自定义文件过滤、翻译语言、任务跟踪等配置

## 适用场景

- 开源项目本地化：将开源项目文档翻译为中文，作为起点
- 代码文档翻译：翻译代码注释和文档字符串
- 持续集成翻译：配合 Git 工作流，自动处理上游更新

## 快速开始

### 1. 前置条件

- Node.js v14+
- Git

### 2. 安装依赖

```bash
npm install
```

### 3. 扫描项目

```bash
node scripts/scan-files.js --project-path /path/to/your/project
```

### 4. 按照任务清单逐个翻译文件

任务清单位于：`<项目根目录>/.todo/project-translation-task.md`

## 配置说明

### 默认配置

项目提供默认配置 `configs/setting.json`，在项目根目录创建 `configs/setting.json` 可覆盖默认配置。

配置示例：

```json
{
  "targetLanguage": "中文",
  "taskTrackingFile": ".todo/project-translation-task.md",
  "fileFilters": {
    "ignoreGitignore": true,
    "supportedExtensions": [".md", ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".cpp", ".c", ".h", ".hpp", ".go", ".rs", ".kt", ".swift", ".rb", ".php", ".scala", ".cs", ".vue"],
    "excludeFiles": ["LICENSE", "COPYRIGHT", "COPYING", "LICENSE.md", "LICENSE.txt", "README.md", "CHANGELOG.md", "CONTRIBUTING.md"],
    "excludeDirs": ["__pycache__", ".git", ".idea", "node_modules", "venv", "env", "dist", "build", "target", ".vscode"]
  },
  "translation": {
    "priority": ["README.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/", "src/", "lib/", "app/"],
    "previewLines": 20
  },
  "experiment": {
    "translateFromDiff": false
  }
}
```

主要配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `targetLanguage` | 目标语言 | "中文" |
| `taskTrackingFile` | 任务跟踪文件路径 | ".todo/project-translation-task.md" |
| `fileFilters.ignoreGitignore` | 是否使用 .gitignore 过滤文件 | true |
| `fileFilters.supportedExtensions` | 支持的文件扩展名 | [".md", ".py", ".js", ...] |
| `fileFilters.excludeFiles` | 排除的文件 | ["LICENSE", "COPYRIGHT", ...] |
| `fileFilters.excludeDirs` | 排除的目录 | ["node_modules", "dist", ...] |
| `translation.priority` | 翻译优先级 | ["README.md", "docs/", ...] |
| `translation.previewLines` | 预览行数 | 20 |
| `experiment.translateFromDiff` | 智能差异翻译（实验性） | false |

## 使用方法

### 基本流程

```bash
# 1. 扫描项目生成任务清单
node scripts/scan-files.js --project-path <项目绝对路径>

# 2. 读取文件内容（前20行）
node scripts/read-file.js --file-path <项目绝对路径>/README.md --max-lines 20

# 3. 翻译文件内容
# 交由本就擅长翻译的 Agent

# 4. 写入翻译后的内容
node scripts/write-file.js --file-path <项目绝对路径>/README.md --content "翻译后的内容"

# 5. 更新任务进度
node scripts/update-todo.js --project-path <项目绝对路径> --file-path README.md --status completed
```

### 主要脚本

| 脚本 | 功能 | 参数 |
|------|------|------|
| `scripts/scan-files.js` | 扫描项目生成待翻译清单 | `--project-path <项目绝对路径>` |
| `scripts/read-file.js` | 读取文件内容 | `--file-path <文件绝对路径>` `--max-lines <行数>` |
| `scripts/write-file.js` | 写入文件内容 | `--file-path <文件绝对路径>` `--content <内容>` |
| `scripts/update-todo.js` | 更新任务进度 | `--project-path <项目绝对路径>` `--file-path <文件绝对路径>` `--status <状态>` |
| `scripts/load-config.js` | 加载配置文件 | `--project-path <项目绝对路径>` |
| `scripts/check-git-conflicts.js` | 检测 Git 更新冲突 | `--project-path <项目绝对路径>` |

## 高级功能

### Git 冲突处理

当执行 `git pull` 后，上游可能更新了已翻译的文件，需要重新处理。

#### 常规模式（默认）

恢复上游版本，重新翻译整个文件：

```bash
# 1. 检测被更新的文件
node scripts/check-git-conflicts.js --project-path <项目绝对路径>

# 2. 恢复上游版本
node scripts/restore-upstream-version.js --project-path <项目绝对路径> --file-path README.md

# 3. 标记为待翻译
node scripts/update-todo.js --project-path <项目绝对路径> --file-path README.md --status pending

# 4. 重新翻译
# （执行基本流程中的步骤2-5）
```

#### 智能差异翻译模式（实验性）

基于 diff 和上下文进行增量翻译，保留已有翻译文件，仅做增量更新：

```json
// 在配置中开启
{
  "experiment": {
    "translateFromDiff": true
  }
}
```

```bash
# 1. 生成 diff 和上下文
node scripts/generate-diff.js --project-path <项目绝对路径> --file-path README.md

# 2. 智能体根据 diff 和上下文进行语义化补全

# 3. 写入更新后的内容
node scripts/write-file.js --file-path <项目绝对路径>/README.md --content "更新后的内容"

# 4. 更新进度
node scripts/update-todo.js --project-path <项目绝对路径> --file-path README.md --status completed
```

**优点**：保留已有翻译，仅更新变更部分，提高效率
**注意**：属于实验性功能，建议先在小范围测试

### 术语表使用

术语表可确保专业术语翻译的一致性和准确性。

#### 支持的格式

**CSV 格式**（`glossary.csv`）

```csv
term,action,translation,reason
AI Agent,translate,智能体,AI Agent 翻译为智能体
skill,keep,skill,在智能体领域，skill 是核心概念，保留英文术语
Machine Learning,translate,机器学习,Machine Learning 翻译为机器学习
Natural Language Processing,translate,自然语言处理,Natural Language Processing 翻译为自然语言处理
API,translate,应用程序接口,API 翻译为应用程序接口
```

**TOML 格式**（`glossary.toml`）

```toml
[[rules]]
term = "AI Agent"
action = "translate"
translation = "智能体"
reason = "AI Agent 翻译为智能体"

[[rules]]
term = "Machine Learning"
action = "translate"
translation = "机器学习"
reason = "Machine Learning 翻译为机器学习"
```

#### 链接术语表

```bash
node scripts/link-glossary.js --file-path /path/to/glossary.csv
```

该脚本会：
- 校验术语表文件格式
- 使用符号链接将文件链接到 `references/glossary/` 目录
- 自动更新 `references/glossary.md` 添加术语表引用

#### 加载术语表

```bash
node scripts/load-glossary.js --file-path /path/to/your/file.md
```

## 项目结构

```
project-translator/
├── SKILL.md                    # 智能体操作指南
├── README.md                   # 项目说明文档（本文件）
├── package.json                # 项目依赖配置
├── configs/
│   └── setting.json            # 默认配置文件
├── scripts/                    # 可执行脚本
│   ├── scan-files.js           # 扫描项目生成待翻译清单
│   ├── read-file.js            # 读取文件内容
│   ├── write-file.js           # 写入文件内容
│   ├── update-todo.js          # 更新任务进度
│   ├── load-config.js          # 加载配置文件
│   ├── check-git-conflicts.js  # 检测 Git 更新冲突
│   ├── restore-upstream-version.js  # 恢复上游版本
│   ├── generate-diff.js        # 生成 diff 和上下文（智能差异翻译）
│   ├── load-glossary.js        # 加载术语表
│   └── link-glossary.js        # 链接术语表文件
├── references/                 # 参考文档
│   ├── workflow-scan.md        # 扫描项目流程
│   ├── workflow-translate.md   # 翻译文件流程
│   ├── workflow-git-conflicts.md  # Git 冲突处理流程
│   ├── workflow-diff-translate.md  # 智能差异翻译流程
│   ├── translation-priority.md     # 翻译优先级规则
│   ├── glossary-usage.md       # 术语表使用说明
│   ├── glossary.md             # 术语表索引
│   └── glossary/               # 术语表文件
│       ├── agent.skill.toml    # 智能体领域术语表
│       └── programming.csv     # 编程领域术语表
└── assets/                     # 资源文件
```

## License

MIT License
