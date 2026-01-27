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
  isSupportedFile
} = require('./utils');

/**
 * 递归扫描项目，返回所有待翻译文件的绝对路径
 */
function scanProject(projectPath, config) {
  projectPath = path.resolve(projectPath);
  const filesToTranslate = [];

  const ignoreGitignore = config?.fileFilters?.ignoreGitignore || false;
  const gitignorePatterns = ignoreGitignore ? readGitignore(projectPath) : [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (shouldExcludeDir(entry.name, config)) continue;
        scanDir(fullPath);
      } else if (entry.isFile()) {
        if (shouldExcludeFile(entry.name, config)) continue;

        // 检查 .gitignore
        if (ignoreGitignore && isIgnoredByGitignore(fullPath, projectPath, gitignorePatterns)) {
          continue;
        }

        if (isSupportedFile(entry.name, config)) {
          filesToTranslate.push(fullPath);
        }
      }
    }
  }

  scanDir(projectPath);
  return filesToTranslate.sort();
}

/**
 * 写入任务清单文件
 */
function writeTodoFile(files, outputPath) {
  outputPath = path.resolve(outputPath);

  // 确保目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let content = '# 待翻译文件清单\n\n';
  files.forEach(file => {
    content += `- [ ] ${file}\n`;
  });

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`已生成待翻译清单: ${outputPath}`);
  console.log(`共 ${files.length} 个文件待翻译`);
}

// 命令行参数解析
const args = process.argv.slice(2);
const projectPathIndex = args.indexOf('--project-path');

if (projectPathIndex === -1 || projectPathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --project-path 参数');
  process.exit(1);
}

const projectPath = args[projectPathIndex + 1];

// 加载配置
const config = loadConfig(projectPath);
if (!config) {
  console.error('错误: 无法加载配置文件');
  process.exit(1);
}

// 从配置获取任务跟踪文件路径
const taskTrackingFile = config.taskTrackingFile || '.todo/project-translation-task.md';
const defaultOutputPath = path.join(path.resolve(projectPath), taskTrackingFile);

// 验证项目路径存在
if (!fs.existsSync(projectPath)) {
  console.error(`错误: 项目路径不存在: ${projectPath}`);
  process.exit(1);
}

// 扫描项目
const files = scanProject(projectPath, config);

// 写入任务清单文件
writeTodoFile(files, defaultOutputPath);
