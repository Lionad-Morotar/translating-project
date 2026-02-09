# Project Translator

Or Codebase Translator，项目翻译 Skill，批量翻译项目文档和代码文件为中文。

## 理念

学习新项目时，我希望项目所有资料都是友善且易读的内容。此想法源于简单的原理：尽管语言是习得性技能，但人的非母语阅读效率仍显著低于母语阅读效率。

严肃的翻译仍然需要人工核查以及承担责任，所以此技能————翻译的目的，也是用于学习项目而不是将旧项目分叉（fork）。

## 示例

![workflow](./public/workflow.png)

原项目：https://github.com/wshobson/agents.git
新项目：https://github.com/Lionad-Morotar/wshobson-agents-cn

## 安装和使用

```bash
npx skill lionad-morotar/project-translator
```

为了获得最可靠的结果，请在提示词前加上 `使用 project-translator 技能：`，如：

```plaintext
使用 project-translator 技能，<你的提示词>
```

这会明确触发技能并确保 AI 遵循文档化的模式。如果不加前缀，技能触发可能不一致，具体取决于你的提示词与技能描述关键词的匹配程度。

你也可以使用 Desktop Agent 以便针对某个项目定时执行拉取更新然后翻译之类的操作。

## 核心功能

- **批量翻译**：自动扫描项目，生成待翻译清单，逐个翻译并追踪进度
- **拉取更新**：支持从 origin/main...upstream/main 逐提交地翻译
- **优先级管理**：自动优先翻译项目入口文档（README）和核心资料
- **术语表**：支持 TOML 和 CSV 格式的术语表，确保术语翻译一致性
- **配置灵活**：支持自定义文件过滤、翻译语言、任务跟踪等配置

## 配置

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


## 术语表

术语表可确保专业术语翻译的一致性和准确性。

#### 支持的格式

**CSV 格式**（`glossary.csv`）

```csv
term,action,translation,reason
AI Agent,translate, 智能体，AI Agent 翻译为智能体
skill,keep,skill, 在智能体领域，skill 是核心概念，保留英文术语
Machine Learning,translate, 机器学习，Machine Learning 翻译为机器学习
Natural Language Processing,translate, 自然语言处理，Natural Language Processing 翻译为自然语言处理
API,translate, 应用程序接口，API 翻译为应用程序接口
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
