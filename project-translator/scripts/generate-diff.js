#!/usr/bin/env node

/**
 * 生成文件 diff 并提取上下文
 *
 * 功能：
 * 1. 获取指定文件在上游和本地的差异
 * 2. 对于每个变更的行，提取原文和译文中的上下文（前后200字符）
 * 3. 生成结构化的 diff 数据，供智能体进行语义化补全
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  parseArgs,
  readFile,
  extractContext
} = require('./utils');

/**
 * 解析 git diff 输出
 */
function parseGitDiff(diffOutput, originalContent, translatedContent) {
  const changes = [];
  const lines = diffOutput.split('\n');
  let currentFile = null;
  let originalLineNum = 0;
  let translatedLineNum = 0;
  let currentChange = null;

  for (const line of lines) {
    // 文件头
    if (line.startsWith('diff --git')) {
      if (currentChange) {
        changes.push(currentChange);
      }
      const parts = line.split(' ');
      const filePath = parts[parts.length - 1].replace(/^[ab]\//, '');
      currentFile = filePath;
      originalLineNum = 0;
      translatedLineNum = 0;
      currentChange = {
        file: filePath,
        chunks: []
      };
      continue;
    }

    // 块头
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (match) {
        originalLineNum = parseInt(match[1]);
        translatedLineNum = parseInt(match[3]);
      }
      continue;
    }

    // 删除行（上游的变更）
    if (line.startsWith('-') && !line.startsWith('---')) {
      const originalContext = extractContext(originalContent, originalLineNum);
      const translatedContext = extractContext(translatedContent, translatedLineNum);

      changes.push({
        type: 'removed',
        file: currentFile,
        originalLineNumber: originalLineNum,
        translatedLineNumber: translatedLineNum,
        content: line.substring(1),
        originalContext,
        translatedContext
      });

      originalLineNum++;
      continue;
    }

    // 添加行（上游的变更）
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const originalContext = extractContext(originalContent, originalLineNum);
      const translatedContext = extractContext(translatedContent, translatedLineNum);

      changes.push({
        type: 'added',
        file: currentFile,
        originalLineNumber: originalLineNum,
        translatedLineNumber: translatedLineNum,
        content: line.substring(1),
        originalContext,
        translatedContext
      });

      translatedLineNum++;
      continue;
    }

    // 普通行（上下文）
    if (!line.startsWith(' ')) {
      continue;
    }

    originalLineNum++;
    translatedLineNum++;
  }

  if (currentChange) {
    changes.push(currentChange);
  }

  return changes;
}

/**
 * 生成 diff
 */
function generateDiff(projectPath, filePath) {
  try {
    // 获取原始内容（上游版本）
    const originalContent = execSync(
      `git show HEAD:${filePath}`,
      { cwd: projectPath, encoding: 'utf-8' }
    );

    // 获取本地翻译内容
    const localPath = path.join(projectPath, filePath);
    const translatedContent = readFile(localPath);

    // 获取工作区和暂存区的差异
    const diffOutput = execSync(
      `git diff HEAD -- "${filePath}"`,
      { cwd: projectPath, encoding: 'utf-8' }
    );

    if (!diffOutput.trim()) {
      return {
        status: 'no_changes',
        message: '文件没有变更'
      };
    }

    // 解析 diff
    const changes = parseGitDiff(diffOutput, originalContent, translatedContent);

    return {
      status: 'success',
      file: filePath,
      changes,
      summary: {
        totalChanges: changes.length,
        removed: changes.filter(c => c.type === 'removed').length,
        added: changes.filter(c => c.type === 'added').length
      }
    };

  } catch (error) {
    throw new Error(`生成 diff 失败: ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  try {
    const params = parseArgs();
    const projectPath = params['project-path'];
    const filePath = params['file-path'];

    const result = generateDiff(projectPath, filePath);

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      message: error.message
    }, null, 2));
    process.exit(1);
  }
}

main();
