---
name: tp:update
description: 同步上游更新并更新翻译
argument-hint: "<path> [--upstream=upstream/main]"
allowed-tools: [Task, Bash]
---

<objective>
获取上游更新，将从当前 tag 到 upstream head 的所有 commit 逐个 patch 的就地翻译到当前分支，最终打标并同步 origin main。

翻译核心原则：
   1. 保持代码结构和注释的对应关系
   2. 根据文件内容自行选择合适的术语表
   3. 保持原始文件的格式和缩进
   4. 只翻译自然语言内容，不翻译代码标识符
</objective>

<process>
1. 首先，确保你在 `translation/cn` 分支
  1.1 使用 `git fetch` 从 origin 和 upstream 拉取更新
  1.2 执行指令 `git describe --tags --abbrev=0`，读取当前 commit 的 git tag，如 “v-<source-commit-id>”，了解当前 commit 是从 upstream 的哪一个 commit 翻译过来的版本
  1.3 如果没有 git tag，默认 `source-commit-id` 为 origin/main 对应的 commit-id
  1.4 默认 `target-commit-id` 为 upstream/main
  1.5 执行指令 `git show <source-commit-id> --oneline -s` 检查项目分支 HEAD 情况
  1.7 根据项目是否从 `source-commit-id` 到 `target-commit-id` 有需要更新的差异:
    1.7.1 有差异，目前为止确定了更新翻译是从 `source-commit-id` 到 `target-commit-id`，继续下一步
    1.7.2 若无差异，输出一句话：“当前项目的翻译已经是最新的啦！”，直接结束任务
2. 输出一句话：“正在获取差异”
  2.1 执行指令 `git log <source-commit-id>..upstream/main --reverse --pretty=format:"%h %s"` 获取有差异的 commit，写入差异清单，每行为一个 commit 对应的 markdown 任务。
3. while (差异清单还有任务) do:
  3.1 读取差异清单的一项，如 “- [] <commit-id> <commit-message>”
  3.2 执行指令 `git show <commit-id> --stat` 以了解哪些文件在这次 commit 涉及了增删改
  3.3 执行指令 `git show <commit-id>` 以了解具体的修改内容
  3.4 根据具体的修改内容：
    3.4.1 如果是新增文件，同样的，翻译并新增
    3.4.2 如果是删除，同样的删除文件
    3.4.3 如果是少量修改（只涉及少数几行或 10 处以内 diff），直接根据差异对项目对应的已翻译文件进行小浮动修改
    3.4.4 如果是大量修改，执行指令 `git show upstream/main:<file-path>` 获取该文件所有变更并重新翻译
  3.5 从差异清单删除此行 commit-id
  3.6 根据差异清单剩余行数，输出一句话：“让我继续完美执行剩下的<剩余任务数量>条任务”
  3.7 循环，直到差异清单内容为空
4. 输出一句话，“差异清单为空，任务结束”，然后开始清理项目
  4.1 删除差异清单文件
  4.2 将所有改动提交到 translation/cn 分支，`git commit -am 'chore: update cn translation'`
  4.3 在 translation/cn 分支打标，`git tag <target-commit-id（六位）>`
  4.4 切换到 main 然后快进到 upstream/main，`git checkout main && git merge upstream/main --ff-only`
  4.5 切换回 translation/cn 分支，`git checkout translation/cn`
</process>

<success_criteria>
- [ ] 当前分支为 translation/cn
- [ ] 上游更新已获取
- [ ] 所有 commit 已处理并应用到工作目录
- [ ] 变更已提交
- [ ] 新标签已创建（格式 `v-<upstream-main-short-hash>`）
- [ ] origin main 已与 upstream main 同步
</success_criteria>
