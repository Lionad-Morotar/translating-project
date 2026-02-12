const fs = require('fs');
const path = require('path');
const { escapeRegExp } = require('./str');
const { sortByPriority } = require('./priority');

/**
 * 确保存在任务清单文件
 */
function ensureTodoFileExists(todoPath) {
  todoPath = path.resolve(todoPath);

  // 确保目录存在
  const todoDir = path.dirname(todoPath);
  if (!fs.existsSync(todoDir)) {
    fs.mkdirSync(todoDir, { recursive: true });
  }
  
  // 确保文件存在
  if (!fs.existsSync(todoPath)) {
    fs.writeFileSync(todoPath, '', 'utf-8');
  }
}

/**
 * 写入任务清单文件
 * @param {Array} files - 文件列表（string 或 { path, translated }）
 * @param {string} outputPath - 输出路径
 * @param {Object} config - 配置对象（可选，用于优先级排序）
 */
function writeTodoFile(files, outputPath, config = {}) {
  outputPath = path.resolve(outputPath);

  // 确保目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let items = (Array.isArray(files) ? files : [])
    .map(file => {
      if (typeof file === 'string') return { path: file, translated: false };
      if (file && typeof file === 'object') {
        const filePath = file.path || file.filePath;
        if (typeof filePath === 'string' && filePath) return { path: filePath, translated: Boolean(file.translated) };
      }
      return null;
    })
    .filter(Boolean);
  
  // 根据配置的优先级排序
  const priorityPatterns = config?.translation?.priority;
  items = sortByPriority(items, priorityPatterns);

  const translatedCount = items.filter(i => i.translated).length;
  const toTranslateCount = items.length - translatedCount;

  let content = '# 项目翻译任务清单\n\n';
  items.forEach(item => {
    content += `- [${item.translated ? 'x' : ' '}] ${item.path}\n`;
  });

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`已生成待翻译清单: ${outputPath}`);
  console.log(`项目内涉及 ${items.length} 个文件，其中 ${translatedCount} 个文件已翻译，剩余 ${toTranslateCount} 个文件需要翻译`);
}

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
  ensureTodoFileExists,
  writeTodoFile,
  readTodoList,
  updateTodoStatus
};
