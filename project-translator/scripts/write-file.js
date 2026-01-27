#!/usr/bin/env node

/**
 * 写入文件内容（覆盖模式）
 */

const fs = require('fs');
const path = require('path');

/**
 * 写入文件内容（覆盖模式）
 */
function writeFile(filePath, content) {
  // 确保目录存在
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`已写入文件: ${filePath}`);
}

// 命令行参数解析
const args = process.argv.slice(2);
const filePathIndex = args.indexOf('--file-path');
const contentIndex = args.indexOf('--content');

if (filePathIndex === -1 || filePathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --file-path 参数');
  process.exit(1);
}

if (contentIndex === -1 || contentIndex + 1 >= args.length) {
  console.error('错误: 缺少 --content 参数');
  process.exit(1);
}

const filePath = args[filePathIndex + 1];
const content = args[contentIndex + 1];

try {
  writeFile(filePath, content);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}
