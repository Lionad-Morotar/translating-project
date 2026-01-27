#!/usr/bin/env node

/**
 * 恢复文件为上游版本
 */

const { execSync } = require('child_process');
const { restoreUpstreamVersion } = require('./utils');

// 命令行参数解析
const args = process.argv.slice(2);
const projectPathIndex = args.indexOf('--project-path');
const filePathIndex = args.indexOf('--file-path');

if (projectPathIndex === -1 || projectPathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --project-path 参数');
  process.exit(1);
}

if (filePathIndex === -1 || filePathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --file-path 参数');
  process.exit(1);
}

const projectPath = args[projectPathIndex + 1];
const filePath = args[filePathIndex + 1];

try {
  restoreUpstreamVersion(projectPath, filePath);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}
