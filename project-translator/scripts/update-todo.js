#!/usr/bin/env node

/**
 * 更新任务清单中的任务进度标记
 */

const fs = require('fs');
const path = require('path');
const {
  loadConfig,
  updateTodoStatus
} = require('./utils');

// 命令行参数解析
const args = process.argv.slice(2);
const projectPathIndex = args.indexOf('--project-path');
const filePathIndex = args.indexOf('--file-path');
const statusIndex = args.indexOf('--status');

if (projectPathIndex === -1 || projectPathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --project-path 参数');
  process.exit(1);
}

if (filePathIndex === -1 || filePathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --file-path 参数');
  process.exit(1);
}

if (statusIndex === -1 || statusIndex + 1 >= args.length) {
  console.error('错误: 缺少 --status 参数');
  process.exit(1);
}

const projectPath = args[projectPathIndex + 1];
const filePath = args[filePathIndex + 1];
const status = args[statusIndex + 1];

// 加载配置
const config = loadConfig(projectPath);
if (!config) {
  console.error('错误: 无法加载配置文件');
  process.exit(1);
}

// 从配置获取任务跟踪文件路径
const taskTrackingFile = config.taskTrackingFile || '.todo/project-translation-task.md';
const defaultTodoPath = path.join(path.resolve(projectPath), taskTrackingFile);

if (!['completed', 'pending'].includes(status)) {
  console.error('错误: --status 必须是 completed 或 pending');
  process.exit(1);
}

try {
  updateTodoStatus(defaultTodoPath, filePath, status);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}
