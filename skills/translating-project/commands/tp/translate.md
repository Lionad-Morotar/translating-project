---
name: tp:translate
description: 翻译项目文件
argument-hint: "<path> [--agent=fork]"
allowed-tools: [Task, Bash]
---

<objective>
翻译项目中所有待翻译文件。这是主工作流程，包含配置加载、扫描、术语表加载、循环翻译和提交。
</objective>

<process>
1. 如果项目没有任务清单，执行指令[生成任务清单](./scan.md)
2. 查找暂存区（默认暂存区的文件已翻译）
  2.1 如果已翻译文件在任务清单中，但没有勾选，则勾选
  2.2 如果已翻译文件不在任务清单，则忽略
3. 执行[术语表指令](./glossary.md)，读取所有术语表
4. 循环，根据任务清单，**批量并行翻译**
  4.1 从任务清单中取出**3个未完成任务**作为一批
      ```bash
      node ~/.claude/skills/translating-project/tools/tp.js todo pending -w /Users/lionad/Github/LLM/pm-skills-cn | head -3
      ```
  4.2 **使用 Task 工具**（`subagent_type: general-purpose`）并行启动 3 个翻译子代理
  4.3 等待子代理结果
  4.4 使用 Task 工具调用 `tp-task-updater` 子代理，**更新任务清单**，把所有已翻译的文件打钩
  4.5 输出一句话：”已完成第 {N} 批翻译（{本批数量} 个文件），预计还剩 {剩余任务数量} 条任务” // 可能有多个翻译代理在工作，所以剩余任务数量可能对不上，是正常的
  4.6 禁止检测翻译质量，禁止等待用户确认或提交
  4.7 **循环**，直到所有任务完成
5. 用户确认后，开始清理工作
  5.1 删除任务清单
  5.2 如果项目配置了 git remote `origin` 和 `upstream`，切换到 `translation/cn` 分支并提交：`git commit -am 'chore: cn translation'`
  5.3 打标以便记录当前翻译对应哪个远端提交：`git tag "v-$(git rev-parse --short=6 main)"`
</process>

<the_subagents>
```yaml
subagent_type: general-purpose
name: translator
allowed-tools: Read、Write、Bash
prompt: [reading from ../../agents/tp-translator.md]
```
```yaml
subagent_type: general-purpose
name: task-updater
allowed-tools: Read、Write、Bash
prompt: [reading from ../../agents/tp-task-updater.md]
```
</the_subagents>

<success_criteria>
- [ ] 任务清单以删除
- [ ] 已经提交并正确打标
</success_criteria>