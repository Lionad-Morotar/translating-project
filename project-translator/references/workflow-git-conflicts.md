# Git 冲突处理流程

## 概述

在执行 `git pull` 更新代码后，如果上游更新了已翻译的文件，需要重新翻译。

## 处理模式

根据配置 `experiment.translateFromDiff` 的值，有两种处理模式：

- **常规模式**（默认）：恢复上游版本，重新翻译整个文件
- **智能差异翻译模式**（实验性）：基于 diff 和上下文进行增量翻译，保留已有翻译

## 1. 检测被更新的已翻译文件

调用 `node scripts/check-git-conflicts.js` 检测哪些已翻译文件在 git pull 后被修改：
```bash
node scripts/check-git-conflicts.js --project-path <项目绝对路径>
```

该脚本会：
- 比较本地翻译版本与上游版本的差异
- 列出被上游修改的已翻译文件
- 输出格式：每行一个文件路径

## 2. 选择处理模式

检查配置中的 `experiment.translateFromDiff` 值：
- 如果为 `false` 或未配置：执行常规模式（见下方）
- 如果为 `true`：执行智能差异翻译模式（见下方）

## 常规模式

### 2.1 恢复上游版本

对于需要重新翻译的文件，调用 `node scripts/restore-upstream-version.js` 恢复上游版本：
```bash
node scripts/restore-upstream-version.js --project-path <项目绝对路径> --file-path <文件绝对路径>
```

该脚本会：
- 使用 `git checkout` 恢复文件为上游版本
- 保留本地的翻译进度信息（通过 `.todo/project-translation-task.md`）

### 2.2 标记为待翻译

调用 `node scripts/update-todo.js` 将恢复的文件标记为待翻译：
```bash
node scripts/update-todo.js --project-path <项目绝对路径> --file-path <文件绝对路径> --status pending
```

### 2.3 重新翻译

按照"翻译文件流程"的步骤，对恢复的文件重新执行翻译。

## 智能差异翻译模式（实验性）

### 2.1 生成 diff 和上下文

调用 `node scripts/generate-diff.js` 生成文件的变更信息和上下文：
```bash
node scripts/generate-diff.js --project-path <项目绝对路径> --file-path <文件绝对路径>
```

该脚本会：
- 获取上游版本（HEAD）和本地版本的差异
- 对每个变更行提取原文和译文中的上下文（前后200字符）
- 输出结构化的 diff 数据供智能体使用

### 2.2 语义化补全

智能体根据 diff 和上下文，执行语义化补全：
1. 读取已翻译的文件内容
2. 分析 diff 中的变更（新增、修改、删除）
3. 结合上下文翻译变更内容
4. 保持已有翻译不变，仅更新变更部分

详见 [智能差异翻译流程](workflow-diff-translate.md)

### 2.3 写入更新后的文件

调用 `node scripts/write-file.js` 写入更新后的内容：
```bash
node scripts/write-file.js --file-path <文件绝对路径> --content <更新后的内容>
```

### 2.4 更新进度

调用 `node scripts/update-todo.js` 标记任务为完成：
```bash
node scripts/update-todo.js --project-path <项目绝对路径> --file-path <文件绝对路径> --status completed
```

## 注意事项

- 常规模式简单可靠，但会丢失已有翻译，需要重新翻译整个文件
- 智能差异翻译模式更高效，保留已有翻译，但属于实验性功能，可能存在边界情况处理不完善的问题
- 如果智能差异翻译失败或结果不满意，可以回退到常规模式重新处理
