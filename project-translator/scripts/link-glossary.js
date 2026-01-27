#!/usr/bin/env node

/**
 * 链接术语表文件到 references/glossary/ 目录
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  validateGlossaryFile,
  createSymlink
} = require('./utils');

/**
 * 主函数
 */
function main(sourceFilePath) {
  console.log(`\n开始处理术语表文件: ${sourceFilePath}\n`);

  // 检查源文件是否存在
  if (!fs.existsSync(sourceFilePath)) {
    throw new Error(`源文件不存在: ${sourceFilePath}`);
  }

  // 获取文件扩展名
  const ext = path.extname(sourceFilePath).toLowerCase();

  // 校验文件格式
  console.log(`正在校验 ${ext.toUpperCase()} 格式文件...`);
  try {
    validateGlossaryFile(sourceFilePath);
  } catch (error) {
    throw new Error(`\n文件校验失败：\n${error.message}`);
  }

  console.log('✓ 文件格式校验通过\n');

  // 确定目标路径
  const fileName = path.basename(sourceFilePath);
  const glossaryDir = path.join(__dirname, '..', 'references', 'glossary');
  const targetPath = path.join(glossaryDir, fileName);

  // 确保 glossary 目录存在
  if (!fs.existsSync(glossaryDir)) {
    fs.mkdirSync(glossaryDir, { recursive: true });
    console.log(`✓ 创建术语表目录: ${glossaryDir}\n`);
  }

  // 检查目标文件是否已存在
  if (fs.existsSync(targetPath)) {
    const stats = fs.lstatSync(targetPath);
    if (stats.isSymbolicLink()) {
      console.log(`✓ 符号链接已存在: ${targetPath}`);
      console.log(`  源文件: ${fs.readlinkSync(targetPath)}\n`);
    } else {
      console.warn(`⚠ 警告: ${targetPath} 已存在且不是符号链接，将被覆盖`);
      fs.unlinkSync(targetPath);
    }
  }

  // 创建符号链接
  console.log(`正在创建符号链接...`);
  createSymlink(sourceFilePath, targetPath);
  console.log(`✓ 符号链接创建成功\n`);

  // 更新 glossary.md
  console.log(`正在更新 glossary.md...`);
  updateGlossaryMD(fileName, ext);
  console.log('✓ glossary.md 更新完成\n');

  console.log('='.repeat(50));
  console.log('术语表链接完成！');
  console.log('='.repeat(50));
  console.log(`\n术语表文件: ${targetPath}`);
  console.log(`格式: ${ext.toUpperCase()}`);
  console.log(`\n现在可以在翻译时使用此术语表了。\n`);
}

/**
 * 更新 glossary.md
 */
function updateGlossaryMD(fileName, ext) {
  const glossaryMDPath = path.join(__dirname, '..', 'references', 'glossary.md');

  if (!fs.existsSync(glossaryMDPath)) {
    console.warn(`⚠ 警告: glossary.md 不存在，跳过更新`);
    return;
  }

  const content = fs.readFileSync(glossaryMDPath, 'utf-8');

  // 检查是否已经存在该术语表的引用
  if (content.includes(fileName)) {
    console.log(`✓ 术语表 ${fileName} 已在 glossary.md 中引用`);
    return;
  }

  // 在"可用术语表"部分添加新术语表
  const domain = path.basename(fileName, ext).replace(/\./g, ' ');
  const format = ext.substring(1).toUpperCase();
  const newEntry = `- ${domain}领域: \`glossary/${fileName}\` (${format}) | ${domain}领域的术语表，相关"${domain}"等关键词\n`;

  const updatedContent = content.replace(
    /(## 可用术语表\n)/,
    `$1${newEntry}`
  );

  fs.writeFileSync(glossaryMDPath, updatedContent, 'utf-8');
  console.log(`✓ 已添加术语表 ${fileName} 到 glossary.md`);
}

// 命令行参数解析
const args = process.argv.slice(2);
const filePathIndex = args.indexOf('--file-path');

if (filePathIndex === -1 || filePathIndex + 1 >= args.length) {
  console.error('\n错误: 缺少 --file-path 参数');
  console.error('\n用法: node scripts/link-glossary.js --file-path <术语表文件路径>');
  console.error('\n示例:');
  console.error('  node scripts/link-glossary.js --file-path /path/to/frontend-terms.csv');
  console.error('  node scripts/link-glossary.js --file-path /path/to/agent.skill.toml\n');
  process.exit(1);
}

const sourceFilePath = args[filePathIndex + 1];

try {
  main(sourceFilePath);
} catch (error) {
  console.error(`\n❌ 错误: ${error.message}\n`);
  process.exit(1);
}
