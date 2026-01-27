const fs = require('fs');
const path = require('path');
const { escapeRegExp } = require('./string');

/**
 * 读取任务清单
 * @param {string} todoPath - 任务清单文件路径
 * @returns {Array} 已完成的文件列表
 */
function readTodoList(todoPath) {
  if (!fs.existsSync(todoPath)) {
    throw new Error(`任务清单不存在: ${todoPath}`);
  }

  const content = fs.readFileSync(todoPath, 'utf-8');
  const lines = content.split('\n');

  const completedFiles = [];
  for (const line of lines) {
    const match = line.match(/^- \[x\] (.+)$/);
    if (match) {
      completedFiles.push(match[1]);
    }
  }

  return completedFiles;
}

/**
 * 更新任务状态
 * @param {string} todoPath - 任务清单文件路径
 * @param {string} filePath - 文件路径
 * @param {string} status - 状态
 */
function updateTodoStatus(todoPath, filePath, status) {
  if (!fs.existsSync(todoPath)) {
    throw new Error(`任务清单不存在: ${todoPath}`);
  }

  const content = fs.readFileSync(todoPath, 'utf-8');
  const lines = content.split('\n');

  const pattern = new RegExp(`^- \\[(x| )\\] ${escapeRegExp(filePath)}$`);
  let updated = false;
  const newLines = lines.map(line => {
    if (pattern.test(line)) {
      updated = true;
      if (status === 'completed') {
        return `- [x] ${filePath}`;
      } else {
        return `- [ ] ${filePath}`;
      }
    }
    return line;
  });

  if (!updated) {
    throw new Error(`在任务清单中未找到文件: ${filePath}`);
  }

  fs.writeFileSync(todoPath, newLines.join('\n'), 'utf-8');
  console.log(`已更新任务清单: ${filePath} -> ${status}`);
}

module.exports = {
  readTodoList,
  updateTodoStatus
};
