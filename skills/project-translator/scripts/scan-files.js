#!/usr/bin/env node

/**
 * 扫描项目生成待翻译文件清单
 */

const fs = require('fs');
const path = require('path');
const {
  loadConfig,
  readGitignore,
  isIgnoredByGitignore,
  shouldExcludeFile,
  shouldExcludeDir,
  isSupportedFile,
  isFileTranslated,
  writeTodoFile
} = require('./utils');

/**
 * 递归扫描项目，返回所有支持文件及其翻译状态
 */
async function scanProject(projectPath, config) {
  projectPath = path.resolve(projectPath);
  const files = [];

  const ignoreGitignore = config?.fileFilters?.ignoreGitignore || false;
  const gitignorePatterns = ignoreGitignore ? readGitignore(projectPath) : [];
  const taskTrackingFile = config?.taskTrackingFile || '.todo/project-translation-task.md';
  const taskTrackingFilePath = path.isAbsolute(taskTrackingFile)
    ? path.resolve(taskTrackingFile)
    : path.resolve(projectPath, taskTrackingFile);

  async function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (shouldExcludeDir(entry.name, config)) continue;
        await scanDir(fullPath);
      } else if (entry.isFile()) {
        if (path.resolve(fullPath) === taskTrackingFilePath) continue;
        if (shouldExcludeFile(entry.name, config)) continue;

        // 检查 .gitignore
        if (ignoreGitignore && isIgnoredByGitignore(fullPath, projectPath, gitignorePatterns)) {
          continue;
        }

        if (isSupportedFile(entry.name, config)) {
          const translated = await isFileTranslated(fullPath, config);
          files.push({ path: fullPath, translated });
          // console.log('[info] file translated:', fullPath, translated)
        }
      }
    }
  }

  await scanDir(projectPath);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function runCli() {
  const args = process.argv.slice(2);
  const projectPathIndex = args.indexOf('--project-path');

  if (projectPathIndex === -1 || projectPathIndex + 1 >= args.length) {
    console.error('错误: 缺少 --project-path 参数');
    process.exit(1);
  }

  const projectPath = args[projectPathIndex + 1];

  const config = loadConfig(projectPath);
  if (!config) {
    console.error('错误: 无法加载配置文件');
    process.exit(1);
  }

  const taskTrackingFile = config.taskTrackingFile || '.todo/project-translation-task.md';
  const defaultOutputPath = path.join(path.resolve(projectPath), taskTrackingFile);

  if (!fs.existsSync(projectPath)) {
    console.error(`错误: 项目路径不存在: ${projectPath}`);
    process.exit(1);
  }

  const files = await scanProject(projectPath, config);
  writeTodoFile(files, defaultOutputPath);
}

if (require.main === module) {
  runCli().catch(error => {
    console.error(`错误: 扫描失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  scanProject
};
