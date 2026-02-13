---
name: tp:translate
description: 翻译项目文件
argument-hint: "<path> [--agent=fork]"
allowed-tools: [Read, Write, Task, Bash]
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
4. 循环，根据任务清单，逐个任务
  4.1 创建 `tp-translator` 子代理，传入完整术语表数据，
      ```xml
      <Task subagent="tp-translator">
      <context>
        <file_path>$FILE_PATH</file_path>
        <glossary_data>$GLOSSARY_DATA</glossary_data>
        <config>$CONFIG_DATA</config>
      </context>
      <instruction>翻译此文件。请根据文件内容分析涉及的技术领域，选择适用的术语表进行翻译。</instruction>
      </Task>
      ```
  4.2 **更新任务清单**，把已翻译的文件打钩
  4.3 压缩上下文（忘记所有的翻译内容，压缩时仅保留“完成了xxx的翻译”即可）
  4.3 根据任务清单，输出一句话：“让我继续完美执行剩下的{剩余任务数量}条任务”
  4.4 循环，**直到**任务清单清空
5. 清理工作
  5.1 删除任务清单
  5.2 切换到 `translation` 分支并提交：`git commit -am 'chore: cn translation'`
  5.3 打标以便记录当前翻译对应哪个远端提交：`git tag "v-$(git rev-parse --short=6 main)"`
</process>

<success_criteria>
- [ ] 任务清单以删除
- [ ] 已经提交并正确打标
</success_criteria>