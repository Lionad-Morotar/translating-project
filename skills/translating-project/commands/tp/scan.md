---
name: tp:scan
description: 扫描项目，查找待翻译文件并生成任务清单
allowed-tools: [Bash]
---

<objective>
扫描项目目录，识别待翻译文件，检测翻译状态，生成按优先级排序的任务清单。
</objective>

<process>
执行以下脚本，生成任务清单：

```bash
node ~/.claude/skills/translating-project/tools/tp.js scan {待翻译项目根目录}
```
</process>

<success_criteria>
- [ ] 任务清单已生成
</success_criteria>
