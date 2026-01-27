#!/usr/bin/env node

/**
 * 读取文件内容（支持行数限制）
 */

const fs = require('fs');
const path = require('path');

/**
 * 加载配置文件
 */
function loadConfig(projectPath) {
  const configPath = path.join(projectPath, 'configs', 'setting.json');

  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`警告: 无法加载项目配置文件 ${configPath}: ${error.message}`);
    }
  }

  const defaultConfigPath = path.join(__dirname, '..', 'configs', 'setting.json');
  try {
    const content = fs.readFileSync(defaultConfigPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`警告: 无法加载默认配置文件 ${defaultConfigPath}: ${error.message}`);
    return null;
  }
}

/**
 * 读取文件内容
 */
function readFile(filePath, maxLines = null) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  if (maxLines) {
    const lines = content.split('\n').slice(0, maxLines).join('\n');
    return lines;
  }

  return content;
}

// 命令行参数解析
const args = process.argv.slice(2);
const filePathIndex = args.indexOf('--file-path');
const maxLinesIndex = args.indexOf('--max-lines');

if (filePathIndex === -1 || filePathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --file-path 参数');
  process.exit(1);
}

const filePath = args[filePathIndex + 1];
let maxLines = null;

// 如果没有显式指定 max-lines，从配置中读取默认值
if (maxLinesIndex !== -1) {
  maxLines = parseInt(args[maxLinesIndex + 1]);
} else {
  // 尝试从文件路径推断项目路径
  const projectPath = path.dirname(filePath);
  const config = loadConfig(projectPath);
  if (config?.translation?.previewLines) {
    maxLines = config.translation.previewLines;
  }
}

try {
  const content = readFile(filePath, maxLines);
  process.stdout.write(content);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}
