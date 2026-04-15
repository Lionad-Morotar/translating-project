---
name: tp:update
description: 同步上游更新并更新翻译
argument-hint: "<path> [--upstream=upstream/main]"
allowed-tools: [Task, Bash]
---

<objective>
获取上游更新，将从当前 tag 到 upstream head 的所有 commit 逐个 patch 到当前翻译分支，最终提交、打标并同步 origin main。
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
   3.2 获取该 tag 对应的 commit hash
       ```bash
       git rev-list -n 1 <tag>
       ```
4. 获取 upstream/main 的 HEAD hash
   ```bash
   git rev-parse upstream/main
   ```
5. 如果当前已同步的 commit 已经等于 upstream/main HEAD，输出 "已是最新，无需更新" 并结束
6. 生成待处理的 commit 列表（从当前 tag 之后到 upstream/main HEAD）
   ```bash
   git log --reverse --format="%H" <current-synced-commit>..upstream/main > /tmp/tp-update-commits.txt
   ```
7. 循环，**批量并行处理 commits**
   7.1 从 commit 列表中取出**3 个未处理 commit**作为一批
       ```bash
       grep -v "^DONE:" /tmp/tp-update-commits.txt | head -3
       ```
   7.2 **使用 Task 工具**（`subagent_type: general-purpose`）启动 1 个 commit-patcher 子代理翻译这三个 commit
   7.3 等待子代理结果
   7.4 输出一句话："已完成第 {N} 批 commit 同步（{本批数量} 个），预计还剩 {剩余数量} 个"
   7.5 禁止检测 patch 质量，禁止等待用户确认或提交
   7.6 **循环**，直到所有 commit 处理完成
8. 所有 commit patch 完毕后，提交更改
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

  输入参数（由调用方注入）：
  - commits: "<commit-hash-1> <commit-hash-2> <commit-hash-3>"

  执行步骤：
  1. 逐个处理这 3 个 commit
     1.1 读取 commit diff：`git show --stat <commit>` 和 `git show <commit>`
     1.2 分析 diff，列出每个 commit 涉及的所有文件及其操作类型（新增 / 修改 / 删除 / 重命名）

  2. 对于 diff 中的每一个文件，按以下规则处理：
     - **推断已翻译文件路径**：根据项目常见翻译文件命名规则，推断该文件对应的中文翻译文件路径。常见模式包括：
       - `foo.md` -> `foo-cn.md`、`foo.zh.md`、`foo.zh-CN.md`、`zh-CN/foo.md`、`docs/zh/foo.md` 等
       - 如果项目内有明确的翻译文件目录结构，优先遵循该结构
       - 如果不确定，使用 Bash 搜索可能的翻译文件：`fd <basename>` 或 `find . -name "*<basename>*"`

     - **新增文件**：
       - 读取上游新文件完整内容
       - 将内容全文翻译为中文
       - 在对应的翻译文件路径创建新文件（使用 Write 工具）

     - **删除文件**：
       - 找到对应的已翻译文件，如果存在则删除（使用 Bash：`rm <translated-file>`）

     - **修改文件**：
       - 读取上游文件的最新版本（`git show upstream/main:<file>` 或 `git show <commit>:<file>`）
       - 读取当前已翻译文件的内容
       - 分析 diff 的语义：理解上游做了哪些内容变更（段落增删、结构调整、链接更新、代码示例修改等）
       - 将相同的语义变更应用到已翻译文档中：
         * 上游新增的段落 -> 在翻译文档对应位置新增中文翻译
         * 上游删除的段落 -> 在翻译文档对应位置删除
         * 上游修改的表述 -> 在翻译文档对应位置修改中文表述（保持翻译风格一致）
         * 上游仅修改代码示例 / 链接 / 格式 -> 在翻译文档中同步相同的技术修改
       - 使用 Write 工具写回修改后的翻译文件

     - **重命名文件**：
       - 视为「删除旧路径 + 新增新路径」的组合操作
       - 如果旧路径有翻译文件，则删除旧翻译文件
       - 为新路径创建翻译文件（参照新增文件逻辑）

  3. 处理过程中不要执行任何 git 提交、不要创建 commit、不要运行 `git cherry-pick`。
  4. 如果某个 commit 的文件完全无法推断翻译路径，或语义化 patch 失败，记录失败的 commit 和文件，继续处理下一个。
  5. 全部处理完毕后，输出一个简洁的汇总：成功处理的 commit 数、失败的项（如有）。
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
