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
0. 首先，确保当前处于 `translation` 分支，并且项目配置了 git remote `origin` 和 `upstream`
1. 如果项目没有任务清单，执行指令[生成任务清单](./scan.md)
2. 查找暂存区（默认暂存区的文件已翻译）
  2.1 如果已翻译文件在任务清单中，但没有勾选，则勾选
  2.2 如果已翻译文件不在任务清单，则忽略
3. 执行[术语表指令](./glossary.md)，读取所有术语表
4. 循环，根据任务清单，**批量并行翻译**
  4.1 从任务清单中取出**最多 3 个未完成任务**作为一批
      - **查找方式**：使用 `sed -n 's/^- \[ \] \(.*\)$/\1/p'` 命令精确匹配 `- [ ] xxx` 格式的剩余任务
      - 或者使用工具函数：`node ~/.claude/skills/translating-project/tools/tp.js todo pending`
  4.2 **使用 Task 工具**（`subagent_type: general-purpose`）并行启动 3 个翻译子代理：

      ```yaml
      # 在单个消息中并行调用 3 个 Task 工具

      # Task 1
      subagent_type: general-purpose
      name: translator
      allowed-tools: Read、Write
      prompt: [reading from ../../agents/tp-translator.md]
      ```

      **关键点**：在单个响应中同时调用 3 个 Task 工具，实现真正的并行执行。

  4.3 等待所有子代理完成，收集结果
  4.4 **更新任务清单**，把所有已翻译的文件打钩
      - 使用 Task 工具调用 `tp-task-updater` 子代理：
      ```yaml
      subagent_type: general-purpose
      name: task-updater
      prompt: [reading from ../../agents/tp-task-updater.md]
      ```
  4.5 压缩上下文（忘记所有的翻译内容，压缩时仅保留”完成了第 N 批翻译：文件 A、B、C”即可）
  4.6 输出一句话：”已完成第 {N} 批翻译（{本批数量} 个文件），还剩 {剩余任务数量} 条任务”
  4.7 循环，**直到**任务清单清空
5. 清理工作
  5.1 删除任务清单
  5.2 切换到 `translation` 分支并提交：`git commit -am 'chore: cn translation'`
  5.3 打标以便记录当前翻译对应哪个远端提交：`git tag "v-$(git rev-parse --short=6 main)"`
</process>

<success_criteria>
- [ ] 任务清单以删除
- [ ] 已经提交并正确打标
</success_criteria>