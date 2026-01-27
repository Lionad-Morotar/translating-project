#!/usr/bin/env node

/**
 * 加载术语表
 * 根据文件路径和上下文加载相关的术语表
 */

const fs = require('fs');
const path = require('path');

/**
 * 读取 CSV 格式的术语表
 */
function loadCSVGlossary(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      return [];
    }

    // 跳过表头
    const rules = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 解析 CSV 行（处理带引号的字段）
      const parts = parseCSVLine(line);
      if (parts.length >= 3) {
        rules.push({
          term: parts[0].trim(),
          action: parts[1].trim(),
          translation: parts[2].trim(),
          reason: parts[3] ? parts[3].trim() : ''
        });
      }
    }

    return rules;
  } catch (error) {
    console.warn(`警告: 无法加载 CSV 术语表 ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * 解析 CSV 行（处理带引号的字段）
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

/**
 * 读取 TOML 格式的术语表
 */
function loadTOMLGlossary(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 简单的 TOML 解析器（仅支持本术语表使用的格式）
    const rules = [];
    const domainMatch = content.match(/domain\s*=\s*"([^"]+)"/);
    const domain = domainMatch ? domainMatch[1] : '';

    // 解析 [[rules]] 数组
    const ruleMatches = content.matchAll(/\[\[rules\]\][\s\S]*?(?=\[\[rules\]\]|$)/g);
    
    for (const match of ruleMatches) {
      const ruleText = match[0];
      const termMatch = ruleText.match(/term\s*=\s*"([^"]+)"/);
      const translationMatch = ruleText.match(/translation\s*=\s*"([^"]+)"/);
      const actionMatch = ruleText.match(/action\s*=\s*"([^"]+)"/);
      const reasonMatch = ruleText.match(/reason\s*=\s*"([^"]+)"/);

      if (termMatch && actionMatch) {
        rules.push({
          domain,
          term: termMatch[1],
          translation: translationMatch ? translationMatch[1] : '',
          action: actionMatch[1],
          reason: reasonMatch ? reasonMatch[1] : ''
        });
      }
    }

    return rules;
  } catch (error) {
    console.warn(`警告: 无法加载 TOML 术语表 ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * 根据文件路径加载单个术语表文件
 */
function loadGlossaryFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.toml') {
    return loadTOMLGlossary(filePath);
  } else if (ext === '.csv') {
    return loadCSVGlossary(filePath);
  }

  return [];
}

/**
 * 根据文件路径匹配领域
 */
function matchDomain(filePath, glossaryDir) {
  const files = fs.readdirSync(glossaryDir);
  const filePathLower = filePath.toLowerCase();

  // 领域关键词映射
  const domainKeywords = {
    'agent': ['agent', 'skill', '智能体', 'workflow'],
    'programming': ['src', 'lib', 'app', 'code', 'programming'],
    'frontend': ['frontend', 'client', 'ui', 'web'],
    'backend': ['backend', 'server', 'api']
  };

  // 按优先级匹配
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    for (const keyword of keywords) {
      if (filePathLower.includes(keyword)) {
        return domain;
      }
    }
  }

  // 默认返回 programming
  return 'programming';
}

/**
 * 加载匹配的术语表
 */
function loadGlossaryByFilePath(filePath) {
  const glossaryDir = path.join(__dirname, '..', 'references', 'glossary');

  if (!fs.existsSync(glossaryDir)) {
    return [];
  }

  const domain = matchDomain(filePath, glossaryDir);
  const files = fs.readdirSync(glossaryDir);

  // 查找匹配的术语表文件
  for (const file of files) {
    const fileName = path.basename(file, path.extname(file));
    if (fileName.startsWith(domain)) {
      const filePathFull = path.join(glossaryDir, file);
      return loadGlossaryFile(filePathFull);
    }
  }

  // 如果没有找到，尝试加载编程领域术语表
  for (const file of files) {
    if (file.startsWith('programming')) {
      const filePathFull = path.join(glossaryDir, file);
      return loadGlossaryFile(filePathFull);
    }
  }

  return [];
}

/**
 * 格式化术语表为智能体可读的格式
 */
function formatGlossaryForAgent(glossaryRules) {
  if (!glossaryRules || glossaryRules.length === 0) {
    return '无术语表规则';
  }

  let formatted = '术语表规则：\n\n';

  // 按动作分类
  const keepRules = glossaryRules.filter(r => r.action === 'keep');
  const translateRules = glossaryRules.filter(r => r.action === 'translate');

  if (keepRules.length > 0) {
    formatted += '以下术语保留原文不翻译：\n';
    keepRules.forEach(rule => {
      formatted += `- ${rule.term}`;
      if (rule.reason) {
        formatted += ` (${rule.reason})`;
      }
      formatted += '\n';
    });
    formatted += '\n';
  }

  if (translateRules.length > 0) {
    formatted += '以下术语需要翻译：\n';
    translateRules.forEach(rule => {
      formatted += `- ${rule.term} → ${rule.translation}`;
      if (rule.reason) {
        formatted += ` (${rule.reason})`;
      }
      formatted += '\n';
    });
  }

  return formatted;
}

// 命令行参数解析
const args = process.argv.slice(2);
const filePathIndex = args.indexOf('--file-path');

if (filePathIndex === -1 || filePathIndex + 1 >= args.length) {
  console.error('错误: 缺少 --file-path 参数');
  process.exit(1);
}

const filePath = args[filePathIndex + 1];

try {
  const glossaryRules = loadGlossaryByFilePath(filePath);
  const formattedGlossary = formatGlossaryForAgent(glossaryRules);
  console.log(formattedGlossary);
} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}
