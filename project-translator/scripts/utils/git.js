const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * 检查文件是否被修改
 * @param {string} projectPath - 项目路径
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否被修改
 */
function checkFileModified(projectPath, filePath) {
  try {
    const relativePath = path.relative(projectPath, filePath);
    const diffOutput = execSync(
      `git diff HEAD -- "${relativePath}"`,
      { cwd: projectPath, encoding: 'utf-8' }
    );

    return diffOutput.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * 检测已修改的文件
 * @param {string} projectPath - 项目路径
 * @param {string} todoPath - 任务清单路径
 * @returns {Array} 已修改的文件列表
 */
function detectModifiedFiles(projectPath, todoPath) {
  const { readTodoList } = require('./todo');
  const completedFiles = readTodoList(todoPath);
  const modifiedFiles = [];

  for (const file of completedFiles) {
    if (fs.existsSync(file)) {
      if (checkFileModified(projectPath, file)) {
        modifiedFiles.push(file);
      }
    }
  }

  return modifiedFiles;
}

/**
 * 恢复文件到上游版本
 * @param {string} projectPath - 项目路径
 * @param {string} filePath - 文件路径
 */
function restoreUpstreamVersion(projectPath, filePath) {
  try {
    const relativePath = path.relative(projectPath, filePath);
    const command = `git checkout HEAD -- "${relativePath}"`;

    execSync(command, { cwd: projectPath, stdio: 'inherit' });
    console.log(`已恢复上游版本: ${filePath}`);
  } catch (error) {
    throw new Error(`恢复上游版本失败: ${error.message}`);
  }
}

module.exports = {
  checkFileModified,
  detectModifiedFiles,
  restoreUpstreamVersion
};
