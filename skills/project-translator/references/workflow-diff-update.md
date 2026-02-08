# Git 冲突处理流程

## 上下文说明

- 差异清单：`<项目根目录>/.todo/git-diff-commit.md`

## 处理步骤

1. 首先，确保你在 `translation` 分支
  1.1 使用 `git fetch` 从 origin 和 upstream 拉取更新
  1.2 读取当前 commit 的 git tag，如 “v-<source-commit-id>”，了解当前 commit 是从 upstream 的哪一个 commit 翻译过来的版本
  1.3 如果没有 git tag，默认 `source-commit-id` 为 origin/main 对应的 commit-id
  1.4 默认 `target-commit-id` 为 upstream/main
  1.5 目前为止确定了更新翻译是从 `source-commit-id` 到 `target-commit-id`
2. 输出一句话：“正在获取差异”
  2.1 执行指令 `git log <source-commit-id>..upstream/main --reverse --pretty=format:"%h %s"` 获取有差异的 commit，写入差异清单，每行为一个 commit 对应的 markdown 任务。
3. 循环：
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
  4.2 将所有改动提交到 translation 分支，`git commit -am 'chore: translation'`
  4.3 在 translation 分支打标，`git tag <target-commit-id（六位数，以便使标签短一些）>`
  4.4 切换到 main 然后快进到 upstream/main，`git checkout main && git merge upstream/main --ff-only`
  4.5 切换回 translation 分支，`git checkout translation`
  4.6 如果用户要求了推送那么推送到远端
