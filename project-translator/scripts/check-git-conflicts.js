#!/usr/bin/env node

/**
 * 检测 Git pull 后被更新的已翻译文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  loadConfig,
  readTodoList,
  checkFileModified,
  detectModifiedFiles
} = require('./utils');

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
const todoPath = path.join(path.resolve(projectPath), taskTrackingFile);

try {
  const modifiedFiles = detectModifiedFiles(projectPath, todoPath);

  if (modifiedFiles.length === 0) {
    console.log('没有发现被更新的已翻译文件');
  } else {
    console.log(`发现 ${modifiedFiles.length} 个被更新的已翻译文件：`);
    modifiedFiles.forEach(file => {
      console.log(file);
    });
  }
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}
