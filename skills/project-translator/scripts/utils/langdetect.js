const fs = require('fs');
const path = require('path');

let francPromise;

function normalizeLanguageTag(language) {
  if (!language) return '';
  const value = String(language).trim().toLowerCase();
  if (!value) return '';

  const normalized = value.replace(/_/g, '-');
  const base = normalized.split('-')[0];
  return base;
}

function normalizeTargetLanguage(targetLanguage) {
  if (!targetLanguage) return '';
  const value = String(targetLanguage).trim().toLowerCase();
  if (!value) return '';

  if (value === '中文' || value === '汉语' || value === '简体中文' || value === '繁體中文' || value === '繁体中文') {
    return 'zh';
  }
  if (value === '英文' || value === '英语' || value === 'english') return 'en';
  if (value === '日文' || value === '日语' || value === 'japanese') return 'ja';
  if (value === '韩文' || value === '韩语' || value === 'korean') return 'ko';
  if (value === '俄文' || value === '俄语' || value === 'russian') return 'ru';

  const base = normalizeLanguageTag(value);
  if (base === 'zh' || base === 'en' || base === 'ja' || base === 'ko' || base === 'ru') return base;
  return base || value;
}

function loadFranc() {
  if (!francPromise) {
    francPromise = import('franc').then(m => ({ franc: m.franc, francAll: m.francAll }));
  }
  return francPromise;
}

function getTargetFrancCodes(targetLanguage) {
  const target = normalizeTargetLanguage(targetLanguage);

  if (target === 'zh') return new Set(['cmn', 'zho', 'yue', 'wuu']);
  if (target === 'en') return new Set(['eng']);
  if (target === 'ja') return new Set(['jpn']);
  if (target === 'ko') return new Set(['kor']);
  if (target === 'ru') return new Set(['rus']);

  return new Set();
}

function getDefaultFrancOnlyList() {
  return [
    'cmn',
    'zho',
    'yue',
    'wuu',
    'eng',
    'jpn',
    'kor',
    'rus',
    'deu',
    'fra',
    'spa',
    'ita',
    'por'
  ];
}

function isMarkdownFile(filePath) {
  const ext = path.extname(String(filePath || '')).toLowerCase();
  return ext === '.md' || ext === '.mdx' || ext === '.markdown';
}

function cleanMarkdownForLangdetect(markdown) {
  let value = String(markdown || '');

  value = value.replace(/^\uFEFF/, '');
  value = value.replace(/^---[\s\S]*?\n---\s*/m, '');
  value = value.replace(/```[\s\S]*?```/g, ' ');
  value = value.replace(/~~~[\s\S]*?~~~/g, ' ');
  value = value.replace(/\*\*[\s\S]*?\*\*/g, ' ');
  value = value.replace(/<!--[\s\S]*?-->/g, ' ');
  value = value.replace(/!\[[^\]]*]\([^)]*\)/g, ' ');
  value = value.replace(/\[([^\]]+)]\([^)]*\)/g, '$1');
  value = value.replace(/^\[[^\]]+]:\s*\S+.*$/gm, ' ');
  value = value.replace(/`[^`]*`/g, ' ');
  value = value.replace(/<[^>]+>/g, ' ');
  value = value.replace(/^#{1,6}\s+/gm, '');
  value = value.replace(/^\s*>\s+/gm, '');
  value = value.replace(/^\s*[-*+]\s+/gm, '');
  value = value.replace(/^\s*\d+\.\s+/gm, '');
  value = value.replace(/https?:\/\/\S+/g, ' ');
  value = value.replace(/-|\|/g, '');
  value = value.replace(/\s+/g, ' ').trim();

  return value;
}

async function detectLanguageFromText(text, config) {
  if (!text) return 'unknown';
  const value = String(text);
  if (!value.trim()) return 'unknown';

  const { francAll } = await loadFranc();
  const minLengthFromConfig = Number(config?.translation?.langdetectMinLength);
  const minLength = Number.isFinite(minLengthFromConfig) && minLengthFromConfig > 0 ? minLengthFromConfig : 3;

  const minScoreFromConfig = Number(config?.translation?.langdetectMinScore);
  const minScore = Number.isFinite(minScoreFromConfig) && minScoreFromConfig >= 0 && minScoreFromConfig <= 1 ? minScoreFromConfig : 0.7;

  const only = Array.isArray(config?.translation?.langdetectOnly) && config.translation.langdetectOnly.length > 0
    ? config.translation.langdetectOnly
    : getDefaultFrancOnlyList();

  const results = francAll(value, { minLength, only });
  if (!Array.isArray(results) || results.length === 0) return 'unknown';

  const [topLang, topScore] = results[0];
  if (!topLang || topLang === 'und') return 'unknown';
  if (typeof topScore === 'number' && topScore < minScore) return 'unknown';

  return String(topLang).trim().toLowerCase();
}

function readFileHead(filePath, maxBytes) {
  const bytes = Number.isFinite(maxBytes) && maxBytes > 0 ? Math.floor(maxBytes) : 65536;
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    const read = fs.readSync(fd, buffer, 0, bytes, 0);
    return buffer.subarray(0, read).toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

function detectLanguageFromFile(filePath, config) {
  const maxBytesFromConfig = Number(config?.translation?.langdetectMaxBytes);
  const sample = readFileHead(filePath, Number.isFinite(maxBytesFromConfig) && maxBytesFromConfig > 0 ? maxBytesFromConfig : 65536);
  const cleaned = isMarkdownFile(filePath) ? cleanMarkdownForLangdetect(sample) : sample;

  // console.log('[info] cleaned', cleaned)
  return detectLanguageFromText(cleaned, config);
}

function isTranslatableByLanguage(filePath, config) {
  return isFileTranslated(filePath, config).then(translated => !translated);
}

async function isFileTranslated(filePath, config) {
  const target = normalizeTargetLanguage(config?.targetLanguage || '中文');
  if (!target) return false;

  const maxBytesFromConfig = Number(config?.translation?.langdetectMaxBytes);
  const maxBytes = Number.isFinite(maxBytesFromConfig) && maxBytesFromConfig > 0 ? maxBytesFromConfig : 65536;

  let sample = '';
  try {
    sample = readFileHead(filePath, maxBytes);
  } catch (error) {
    return false;
  }

  if (isMarkdownFile(filePath)) {
    sample = cleanMarkdownForLangdetect(sample);
  }

  const allowed = getTargetFrancCodes(target);
  if (allowed.size === 0) return false;

  const { francAll } = await loadFranc();
  const minLengthFromConfig = Number(config?.translation?.langdetectMinLength);
  const minLength = Number.isFinite(minLengthFromConfig) && minLengthFromConfig > 0 ? minLengthFromConfig : 3;

  const only = Array.isArray(config?.translation?.langdetectOnly) && config.translation.langdetectOnly.length > 0
    ? config.translation.langdetectOnly
    : getDefaultFrancOnlyList();

  const results = francAll(sample, { minLength, only });
  if (!Array.isArray(results) || results.length === 0) return false;

  const best = results[0];
  const bestScore = typeof best?.[1] === 'number' ? best[1] : 0;

  let targetScore = 0;
  for (const [lang, score] of results) {
    if (allowed.has(String(lang).toLowerCase())) {
      if (typeof score === 'number' && score > targetScore) targetScore = score;
    }
  }

  const minTargetScoreFromConfig = Number(config?.translation?.langdetectMinTargetScore);
  const minTargetScore = Number.isFinite(minTargetScoreFromConfig) && minTargetScoreFromConfig >= 0 && minTargetScoreFromConfig <= 1
    ? minTargetScoreFromConfig
    : 0.85;

  const maxDeltaFromConfig = Number(config?.translation?.langdetectMaxDelta);
  const maxDelta = Number.isFinite(maxDeltaFromConfig) && maxDeltaFromConfig >= 0 && maxDeltaFromConfig <= 1
    ? maxDeltaFromConfig
    : 0.12;

  if (targetScore <= 0) return false;
  if (targetScore < minTargetScore) return false;
  if (bestScore - targetScore > maxDelta) return false;

  return true;
}

module.exports = {
  normalizeLanguageTag,
  normalizeTargetLanguage,
  detectLanguageFromText,
  detectLanguageFromFile,
  isFileTranslated,
  isTranslatableByLanguage
};
