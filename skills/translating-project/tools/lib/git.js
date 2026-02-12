const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { isSupportedFile } = require('./filter');

/**
 * 检查文件是否被修改
 * @param {string} projectPath - 项目路径
 * @param {string} filePath - 文件路径
 * @param {string} targetBranch - 目标分支
 * @returns {boolean} 是否被修改
 */
function checkFileModified(projectPath, filePath, targetBranch = 'upstream/master') {
  try {
    const relativePath = path.relative(projectPath, filePath);
    const diffOutput = execSync(
      `git diff ${targetBranch} -- "${relativePath}"`,
      { cwd: projectPath, encoding: 'utf-8' }
    );

    return diffOutput.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * 检测已修改的文件（与目标分支对比）
 * @param {string} projectPath - 项目路径
 * @param {string} targetBranch - 目标分支
 * @returns {Array} 已修改的文件列表
 */
function detectModifiedFiles(projectPath, targetBranch = 'upstream/master') {
  try {
    const { loadConfig } = require('./config');
    const config = loadConfig(projectPath);

    const diffOutput = execSync(
      `git diff --name-only ${targetBranch}`,
      { cwd: projectPath, encoding: 'utf-8' }
    );

    const changedFiles = diffOutput.trim().split('\n').filter(Boolean);
    const modifiedFiles = [];

    for (const file of changedFiles) {
      const filePath = path.join(projectPath, file);
      const filename = path.basename(file);

      if (fs.existsSync(filePath) && isSupportedFile(filename, config)) {
        modifiedFiles.push(filePath);
      }
    }

    return modifiedFiles;
  } catch (error) {
    console.warn(`检测修改文件失败: ${error.message}`);
    return [];
  }
}

/**
 * 恢复文件到上游版本
 * @param {string} projectPath - 项目路径
 * @param {string} filePath - 文件路径
 */
function restoreUpstreamVersion(projectPath, filePath, targetBranch = 'upstream/master') {
  try {
    const relativePath = path.relative(projectPath, filePath);
    const command = `git checkout ${targetBranch} -- "${relativePath}"`;

    execSync(command, { cwd: projectPath, stdio: 'inherit' });
    console.log(`已恢复上游版本: ${filePath}`);
  } catch (error) {
    throw new Error(`恢复上游版本失败: ${error.message}`);
  }
}

/**
 * 获取 Git 仓库根目录
 * @param {string} cwd - 起始目录（可选，默认当前工作目录）
 * @returns {string|null} Git 仓库根目录，如果不是 git 仓库则返回 null
 */
function getGitRoot(cwd = process.cwd()) {
  try {
    const root = execSync('git rev-parse --show-toplevel', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'] // 忽略错误输出
    }).trim();
    return root;
  } catch (error) {
    return null;
  }
}

module.exports = {
  checkFileModified,
  detectModifiedFiles,
  restoreUpstreamVersion,
  getGitRoot
};
