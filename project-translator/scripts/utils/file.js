const fs = require('fs');
const path = require('path');

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {string} 文件内容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`无法读取文件: ${filePath}`);
  }
}

/**
 * 写入文件内容
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`无法写入文件: ${filePath}`);
  }
}

/**
 * 提取指定行的上下文
 * @param {string} content - 文件内容
 * @param {number} lineNumber - 行号
 * @param {number} contextSize - 上下文大小
 * @returns {Object} 上下文对象 {before, after}
 */
function extractContext(content, lineNumber, contextSize = 200) {
  const lines = content.split('\n');
  const index = lineNumber - 1;

  if (index < 0 || index >= lines.length) {
    return { before: '', after: '' };
  }

  const line = lines[index];
  const lineStart = content.indexOf(line, Math.max(0, content.split('\n').slice(0, index).join('\n').length));

  const beforeStart = Math.max(0, lineStart - contextSize);
  const beforeEnd = lineStart;
  const afterStart = lineStart + line.length;
  const afterEnd = Math.min(content.length, afterStart + contextSize);

  return {
    before: content.substring(beforeStart, beforeEnd),
    after: content.substring(afterStart, afterEnd)
  };
}

/**
 * 创建符号链接
 * @param {string} sourcePath - 源路径
 * @param {string} targetPath - 目标路径
 */
function createSymlink(sourcePath, targetPath) {
  try {
    try {
      const stats = fs.lstatSync(targetPath);
      if (stats.isSymbolicLink() || stats.isFile()) {
        fs.unlinkSync(targetPath);
      }
    } catch (e) {
    }

    fs.symlinkSync(sourcePath, targetPath);
    console.log(`已创建符号链接: ${targetPath} -> ${sourcePath}`);
  } catch (error) {
    throw new Error(`创建符号链接失败: ${error.message}`);
  }
}

module.exports = {
  readFile,
  writeFile,
  extractContext,
  createSymlink
};
