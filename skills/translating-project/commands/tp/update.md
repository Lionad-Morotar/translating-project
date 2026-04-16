---
name: tp:update
description: 同步上游更新并更新翻译
argument-hint: "<path> [--upstream=upstream/main]"
allowed-tools: [Task, Bash]
---

<objective>
获取上游更新，将从当前 tag 到 upstream head 的所有 commit 逐个 patch 的就地翻译到当前分支，最终打标并同步 origin main。
</objective>

<process>
1. 确保当前在 `translation/cn` 分支，如果不是则切换
   ```bash
   # 直接切换到分支
   git checkout translation/cn
   # 部分老项目在 translation 分支，需要创建，执行前使用 Ask 工具请求用户确认！
   git checkout translation && git checkout -b backup/translation && git branch -D translation && git checkout -b translation/cn && ...
   ```
2. 获取上游最新状态
   ```bash
   git fetch upstream main
   ```
3. 找到当前已同步的 upstream commit
   3.1 查找本地最新的 `v-*` tag
       ```bash
       git describe --tags --match "v-*" --abbrev=0
       ```
   3.2 获取该 tag 对应的 commit hash：<current-synced-commit>
       ```bash
       git rev-list -n 1 <tag>
       ```
   3.3 如何 `v-*` tag 不在 `translation/cn` 的 HEAD，说明某些任务进行到一半：
      3.3.1 查找 HEAD 的 commit message 能不能匹配到 upstream main 的某个 commit message
      3.3.2 可以匹配则 <current-synced-commit> 为当前 commit hash
      3.3.3 如果匹配不上则 <current-synced-commit> 设置为最新 v-* 所在 commit hash
4. 获取 upstream/main 的 HEAD hash
   ```bash
   git rev-parse upstream/main
   ```
5. 如果当前已同步的 commit 已经等于 upstream/main HEAD，输出 "已是最新，无需更新" 并结束
6. 生成待处理的 commit 列表（从当前 tag 之后到 upstream/main HEAD）
   ```bash
   git log --reverse --format="%H" <current-synced-commit>..upstream/main > <project_root>/.tasks/tp-update-commits.txt
   ```
7. 循环
   7.1 从 commit 列表中取出**3 个未处理 commit**作为一批
       ```bash
       grep -v "^DONE:" <project_root>/.tasks/tp-update-commits.txt | head -3
       ```
   7.2 创建 1 个子代理翻译这三个 commit
   7.3 等待子代理结果
   7.4 输出一句话："已完成第 {N} 批 commit 同步（{本批数量} 个），预计还剩 {剩余数量} 个"
   7.5 禁止检测 patch 质量，禁止等待用户确认或提交
   7.6 commit 到 `translation/cn` 分支，使用和原 commit 相同的提交信息
   7.7 **循环**，直到所有 commit 处理完成
8. 所有 commit patch 完毕后，应当没有未提交文件，如有则：
   ```bash
   git add -A && git commit -m "sync: upstream updates"
   ```
9. 在当前分支（translation/cn）打上新的 tag，`xxxx` 即为 upstream main HEAD 的短 hash
   ```bash
   git tag "v-$(git rev-parse --short=6 upstream/main)"
   ```
10. 同步 origin main 与 upstream main
    10.1 将 upstream/main 推送到 origin/main
         ```bash
         git push origin upstream/main:main
         ```
</process>

<the_subagents>
```yaml
subagent_type: general-purpose
name: commit-patcher
allowed-tools: Read, Write, Bash
prompt: |
  你是一个翻译项目的 commit 同步专家。你的任务是将上游 commit 的变更语义化地应用到已翻译的文档上。

  翻译核心原则：
    1. 保持代码结构和注释的对应关系
    2. 根据文件内容自行选择合适的术语表
    3. 保持原始文件的格式和缩进
    4. 只翻译自然语言内容，不翻译代码标识符

  输入参数（由调用方注入）：
  - commits: "<commit-hash-1> <commit-hash-2> <commit-hash-3> ..."

  执行步骤：
  1. 逐个处理 commits
     1.1 读取 commit diff：`git show --stat <commit>` 和 `git show <commit>`
     1.2 分析 diff，列出每个 commit 涉及的所有文件及其操作类型（新增 / 修改 / 删除 / 重命名）
      - 新增：跳过代码类型文件，除非用户明确要求翻译注释、代码内字符串内容，否则仅翻译文档为中文
      - 删除：删除对应文件
      - 修改**：读取差异，分析然后应用并翻译到已有文档
     1.3 按照原 commit message （commit message 无需翻译）提交到 `translation/cn` 分支
  3. 禁止 `git cherry-pick`
  4. 全部 commits 处理完，输出一个简洁的汇总：成功处理的 commit 数、失败的项（如有）。
```
</the_subagents>

<success_criteria>
- [ ] 当前分支为 translation/cn
- [ ] 上游更新已获取
- [ ] 所有 commit 已处理并应用到工作目录
- [ ] 变更已提交
- [ ] 新标签已创建（格式 `v-<upstream-main-short-hash>`）
- [ ] origin main 已与 upstream main 同步
</success_criteria>
