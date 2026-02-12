import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

import { scanProject } from '../skills/translating-project/tools/scan.js';
import {
  normalizeTargetLanguage,
  detectLanguageFromText,
  isFileTranslated
} from '../skills/translating-project/tools/lib/lang.js';
import { extractAndWriteInnerDictionary } from '../skills/translating-project/tools/lib/dict/index.js';

const TMP_DIR = join(process.cwd(), 'tmp', 'scan-files-langdetect');

describe('scan-files + langdetect', () => {
  beforeEach(() => {
    if (!existsSync(TMP_DIR)) {
      mkdirSync(TMP_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TMP_DIR)) {
      rmSync(TMP_DIR, { recursive: true, force: true });
    }
  });

  it('normalizeTargetLanguage should map 中文 to zh', () => {
    expect(normalizeTargetLanguage('中文')).toBe('zh');
    expect(normalizeTargetLanguage('zh-CN')).toBe('zh');
    expect(normalizeTargetLanguage('English')).toBe('en');
  });

  it('detectLanguageFromText should detect zh/en', async () => {
    const zh = await detectLanguageFromText('这是一个测试文档内容，用于语言识别。', {
      translation: { langdetectOnly: ['cmn', 'zho', 'yue', 'wuu'], langdetectMinLength: 3 }
    });
    const en = await detectLanguageFromText('This is a test document content for language detection.', {
      translation: { langdetectOnly: ['eng'], langdetectMinLength: 3 }
    });

    expect(zh).toMatch(/^(cmn|zho|yue|wuu)$/);
    expect(en).toMatch(/^(eng)$/);
  });

  it('isFileTranslated should detect files already in target language', async () => {
    const chineseFile = join(TMP_DIR, 'chinese.md');
    const englishFile = join(TMP_DIR, 'english.md');
    writeFileSync(
      chineseFile,
      '这是中文内容，用于测试语言检测是否能够稳定判断为中文。我们再补充一些中文句子，让样本更长、更明确。'
    );
    writeFileSync(
      englishFile,
      'This is English content for language detection testing. Adding more sentences to make the sample longer and clearer.'
    );

    const config = {
      targetLanguage: '中文',
      fileFilters: { ignoreGitignore: false, supportedExtensions: ['.md'], excludeFiles: [], excludeDirs: [] },
      translation: { langdetectMinLength: 3 }
    };

    await expect(isFileTranslated(chineseFile, config)).resolves.toBe(true);
    await expect(isFileTranslated(englishFile, config)).resolves.toBe(false);
  });

  it('isFileTranslated should ignore markdown code blocks', async () => {
    const filePath = join(TMP_DIR, 'mixed.md');
    writeFileSync(
      filePath,
      `# 标题

这是中文内容，用于判断是否已经翻译。这段中文应该主导语言检测。

| Col A | Col B |
| --- | --- |
| This is an English row that should be ignored by langdetect. | Another English cell. |

\`\`\`ts
export function helloWorld() {
  console.log("This is a long English code block that should be ignored by langdetect.");
  return "hello";
}
\`\`\`

更多中文内容，继续增强检测结果。`
    );

    const config = {
      targetLanguage: '中文',
      fileFilters: { ignoreGitignore: false, supportedExtensions: ['.md'], excludeFiles: [], excludeDirs: [] },
      translation: { langdetectMinLength: 3, langdetectTopN: 3, langdetectTopMinScore: 0.9 }
    };

    await expect(isFileTranslated(filePath, config)).resolves.toBe(true);
  });

  it('isFileTranslated should strip dictionary words during markdown cleaning', async () => {
    const dictPath = join(TMP_DIR, 'inner.json');
    writeFileSync(dictPath, '{}\n');
    extractAndWriteInnerDictionary(' React WebSockets Next.js ', { dictPath });

    const filePath = join(TMP_DIR, 'dict-heavy.md');
    writeFileSync(
      filePath,
      `这是中文内容。

React WebSockets Next.js React WebSockets Next.js React WebSockets Next.js React WebSockets Next.js React WebSockets Next.js
React WebSockets Next.js React WebSockets Next.js React WebSockets Next.js React WebSockets Next.js React WebSockets Next.js
`
    );

    const config = {
      targetLanguage: '中文',
      fileFilters: { ignoreGitignore: false, supportedExtensions: ['.md'], excludeFiles: [], excludeDirs: [] },
      translation: { langdetectMinLength: 3, langdetectTopN: 3, langdetectTopMinScore: 0.9, dictPath }
    };

    await expect(isFileTranslated(filePath, config)).resolves.toBe(true);
  });

  it('scanProject should include all supported files with translated flag', async () => {
    const docsDir = join(TMP_DIR, 'docs');
    mkdirSync(docsDir, { recursive: true });
    const todoDir = join(TMP_DIR, '.todo');
    mkdirSync(todoDir, { recursive: true });

    const chineseFile = join(docsDir, 'cn.md');
    const englishFile = join(docsDir, 'en.md');
    const otherExt = join(docsDir, 'note.txt');
    const taskTrackingFile = join(todoDir, 'project-translation-task.md');
    writeFileSync(
      chineseFile,
      '这是中文内容，用于测试 scanProject 是否能标记为已翻译。为了让语言检测更稳定，这里再多写一些中文内容。'
    );
    writeFileSync(
      englishFile,
      'This is English content that should be translated. Add more English text to make language detection more confident.'
    );
    writeFileSync(otherExt, 'This file should be ignored by extension.');
    writeFileSync(taskTrackingFile, '# Task list\n\n- [ ] docs/en.md\n');

    const config = {
      targetLanguage: '中文',
      taskTrackingFile: '.todo/project-translation-task.md',
      fileFilters: { ignoreGitignore: false, supportedExtensions: ['.md'], excludeFiles: [], excludeDirs: [] },
      translation: { langdetectMinLength: 3 }
    };

    const files = await scanProject(TMP_DIR, config);
    expect(files).toEqual([
      { path: chineseFile, translated: true },
      { path: englishFile, translated: false }
    ]);
  });
});
