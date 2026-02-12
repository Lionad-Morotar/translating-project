---
name: tp:update
description: 同步上游更新并更新翻译
argument-hint: "<path> [--upstream=upstream/main]"
allowed-tools: [Read, Write, Task, Bash]
---

<objective>
获取上游更新，分析提交差异，更新翻译以保持一致。
</objective>

<process>
创建 `tp-updater` 代理执行此任务。
</process>

<output>
- 与上游一致的更新翻译
- 新的 git 标签（如 `v-a1b2c3`）
</output>

<success_criteria>
- [ ] 上游更新已获取
- [ ] 所有提交已处理
- [ ] 翻译已更新
- [ ] 新标签已创建
</success_criteria>
