import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

import {
  readInnerDictionary,
  extractAndWriteInnerDictionary,
  extractAndWriteInnerDictionaryFromTempTxt
} from '../skills/translating-project/tools/lib/dict/index.js';

const TMP_DIR = join(process.cwd(), 'tmp', 'dict-test');

describe('dict utils', () => {
  const dictPath = join(TMP_DIR, 'inner.json');

  beforeEach(() => {
    if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(dictPath, '{}\n');
  });

  afterEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('extractAndWriteInnerDictionary should extract words and write trie', () => {
    const text = '这是 React 和 WebSockets 示例。';
    const result = extractAndWriteInnerDictionary(text, { dictPath });

    expect(result.words).toEqual(['React', 'WebSockets']);
    expect(result.added).toEqual(['React', 'WebSockets']);

    const list = readInnerDictionary({ dictPath });
    expect(list).toEqual(['React', 'WebSockets']);
  });

  it('extractAndWriteInnerDictionary should be case-insensitive and not duplicate', () => {
    extractAndWriteInnerDictionary('这是 React 示例。', { dictPath });
    extractAndWriteInnerDictionary('这是 react 示例。', { dictPath });

    const list = readInnerDictionary({ dictPath });
    expect(list).toEqual(['React']);
  });

  it('extractAndWriteInnerDictionaryFromTempTxt should read temp text and write trie', () => {
    const tempTxtPath = join(TMP_DIR, 'temp.txt');
    writeFileSync(tempTxtPath, '这是 React 和 WebSockets 示例。');

    const result = extractAndWriteInnerDictionaryFromTempTxt({ tempTxtPath, dictPath });
    expect(result.words).toEqual(['React', 'WebSockets']);
    expect(result.added).toEqual(['React', 'WebSockets']);

    const list = readInnerDictionary({ dictPath });
    expect(list).toEqual(['React', 'WebSockets']);
  });
});
