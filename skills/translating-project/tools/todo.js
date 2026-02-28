#!/usr/bin/env node

/**
 * todo 命令 - 任务清单管理
 * 
 * 用法: tp todo <subcommand> [options]
 */

const fs = require('fs');
const path = require('path');

const { findPendingTasks, generateSedFindPendingCommand } = require('./lib/todo');

const SUBCOMMANDS = {
  list,
  pending,
  'sed-pending': sedPending,
  update,
  clear,
};

function parseArgs(args) {
  const options = {
    subcommand: null,
    args: [],
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (!options.subcommand && !arg.startsWith('-')) {
      options.subcommand = arg;
    } else {
      options.args.push(arg);
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
任务清单管理

用法: tp todo <subcommand> [options]

子命令:
  list                 列出任务清单
  pending              列出剩余待翻译任务
  sed-pending          使用 sed 模式列出剩余任务
  update <file>        更新任务状态
  clear                清空任务清单

示例:
  tp todo list
  tp todo pending
  tp todo sed-pending
  tp todo update README.md --status=done
  tp todo clear
`);
}

function getTodoPath() {
  return path.join(process.cwd(), '.todo', 'tp-tasks.md');
}

async function list() {
  const todoPath = getTodoPath();

  if (!fs.existsSync(todoPath)) {
    console.log('任务清单不存在');
    return;
  }

  const content = fs.readFileSync(todoPath, 'utf8');
  console.log(content);
}

async function pending() {
  const todoPath = getTodoPath();

  if (!fs.existsSync(todoPath)) {
    console.log('任务清单不存在');
    return;
  }

  const pendingFiles = findPendingTasks(todoPath);

  if (pendingFiles.length === 0) {
    console.log('没有待翻译的任务');
    return;
  }

  console.log(`剩余 ${pendingFiles.length} 个待翻译任务：`);
  pendingFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
}

async function sedPending() {
  const todoPath = getTodoPath();

  if (!fs.existsSync(todoPath)) {
    console.log('任务清单不存在');
    return;
  }

  const sedCommand = generateSedFindPendingCommand(todoPath);
  console.log('使用 sed 模式查找剩余任务：');
  console.log(`命令: ${sedCommand}`);
  console.log();

  // 执行 sed 命令
  const { execSync } = require('child_process');
  try {
    const result = execSync(sedCommand, { encoding: 'utf8' });
    if (result.trim()) {
      console.log('剩余待翻译任务：');
      console.log(result);
    } else {
      console.log('没有待翻译的任务');
    }
  } catch (error) {
    console.log('执行 sed 命令时出错:', error.message);
  }
}

async function update(args) {
  const [filePath, ...rest] = args;
  
  if (!filePath) {
    throw new Error('请指定文件路径');
  }
  
  // 解析 --status 参数
  const statusIndex = rest.indexOf('--status');
  const status = statusIndex !== -1 ? rest[statusIndex + 1] : 'done';
  
  const todoPath = getTodoPath();
  if (!fs.existsSync(todoPath)) {
    throw new Error('任务清单不存在');
  }
  
  let content = fs.readFileSync(todoPath, 'utf8');
  
  // 简单的任务状态更新：将 - [ ] 改为 - [x]
  const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(- \\[ \\]) (.*${escapedPath}.*)`, 'g');
  content = content.replace(regex, `- [x] $2`);
  
  fs.writeFileSync(todoPath, content);
  console.log(`更新任务: ${filePath} -> ${status}`);
}

async function clear() {
  const todoPath = getTodoPath();
  
  if (fs.existsSync(todoPath)) {
    fs.unlinkSync(todoPath);
    console.log('已清空任务清单');
  } else {
    console.log('任务清单不存在');
  }
}

async function command(args) {
  const options = parseArgs(args);
  
  if (!options.subcommand) {
    console.error('错误: 请指定子命令');
    showHelp();
    process.exit(1);
  }
  
  const handler = SUBCOMMANDS[options.subcommand];
  if (!handler) {
    console.error(`错误: 未知子命令 "${options.subcommand}"`);
    showHelp();
    process.exit(1);
  }
  
  return await handler(options.args);
}

module.exports = command;

if (require.main === module) {
  command(process.argv.slice(2)).catch(error => {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  });
}
