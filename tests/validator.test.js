import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateCSV, validateTOML, validateGlossaryFile } from '../skills/translating-project/tools/lib/valid.js';
import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const TMP_DIR = join(process.cwd(), 'tmp');

describe('validator', () => {
  describe('validateCSV', () => {
    beforeEach(() => {
      if (!existsSync(TMP_DIR)) {
        mkdirSync(TMP_DIR, { recursive: true });
      }
    });

    afterEach(() => {
      if (existsSync(TMP_DIR)) {
        const { readdirSync } = require('fs');
        const files = readdirSync(TMP_DIR);
        files.forEach(file => {
          rmSync(join(TMP_DIR, file), { recursive: true, force: true });
        });
      }
    });

    describe('valid CSV files', () => {
      it('should validate a complete CSV file with all columns', () => {
        const filePath = join(TMP_DIR, 'valid-complete.csv');
        const content = 'term,action,translation,reason\nbug,translate,缺陷,bug 翻译为缺陷';
        writeFileSync(filePath, content);

        const result = validateCSV(filePath);
        expect(result).toBe(true);
      });

      it('should validate a CSV file with keep action', () => {
        const filePath = join(TMP_DIR, 'valid-keep.csv');
        const content = 'term,action,translation,reason\nskill,keep,skill,在智能体领域，skill 是核心概念，保留英文术语';
        writeFileSync(filePath, content);

        const result = validateCSV(filePath);
        expect(result).toBe(true);
      });

      it('should validate a CSV file without reason column', () => {
        const filePath = join(TMP_DIR, 'valid-no-reason.csv');
        const content = 'term,action,translation\nbug,translate,缺陷';
        writeFileSync(filePath, content);

        const result = validateCSV(filePath);
        expect(result).toBe(true);
      });

      it('should validate a CSV file with multiple entries', () => {
        const filePath = join(TMP_DIR, 'valid-multiple.csv');
        const content = `term,action,translation,reason
bug,translate,缺陷,bug 翻译为缺陷
commit,translate,提交,commit 翻译为提交
pull request,translate,拉取请求,pull request 翻译为拉取请求`;
        writeFileSync(filePath, content);

        const result = validateCSV(filePath);
        expect(result).toBe(true);
      });
    });

    describe('invalid CSV files', () => {
      it('should throw error when file has no data rows', () => {
        const filePath = join(TMP_DIR, 'invalid-no-data.csv');
        const content = 'term,action,translation,reason';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/至少需要包含表头和一行数据/);
      });

      it('should throw error when missing required column term', () => {
        const filePath = join(TMP_DIR, 'invalid-missing-term.csv');
        const content = 'action,translation,reason\ntranslate,缺陷,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/缺少必需的列 "term"/);
      });

      it('should throw error when missing required column action', () => {
        const filePath = join(TMP_DIR, 'invalid-missing-action.csv');
        const content = 'term,translation,reason\nbug,缺陷,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/缺少必需的列 "action"/);
      });

      it('should throw error when missing required column translation', () => {
        const filePath = join(TMP_DIR, 'invalid-missing-translation.csv');
        const content = 'term,action,reason\nbug,translate,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/缺少必需的列 "translation"/);
      });

      it('should throw error when action is not keep or translate', () => {
        const filePath = join(TMP_DIR, 'invalid-action.csv');
        const content = 'term,action,translation,reason\ntest,invalid,测试,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/"action" 字段值必须是 "keep" 或 "translate"，当前值为 "invalid"/);
      });

      it('should throw error when term field is empty', () => {
        const filePath = join(TMP_DIR, 'invalid-empty-term.csv');
        const content = 'term,action,translation,reason\n,translate,测试,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/"term" 字段不能为空/);
      });

      it('should throw error when action field is empty', () => {
        const filePath = join(TMP_DIR, 'invalid-empty-action.csv');
        const content = 'term,action,translation,reason\ntest,,测试,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/"action" 字段不能为空/);
      });

      it('should throw error when action is translate but translation is empty', () => {
        const filePath = join(TMP_DIR, 'invalid-empty-translation.csv');
        const content = 'term,action,translation,reason\ntest,translate,,测试说明';
        writeFileSync(filePath, content);

        expect(() => validateCSV(filePath)).toThrow(/当 action 为 "translate" 时，"translation" 字段不能为空/);
      });
    });
  });

  describe('validateTOML', () => {
    beforeEach(() => {
      if (!existsSync(TMP_DIR)) {
        mkdirSync(TMP_DIR, { recursive: true });
      }
    });

    afterEach(() => {
      if (existsSync(TMP_DIR)) {
        const { readdirSync } = require('fs');
        const files = readdirSync(TMP_DIR);
        files.forEach(file => {
          rmSync(join(TMP_DIR, file), { recursive: true, force: true });
        });
      }
    });

    describe('valid TOML files', () => {
      it('should validate a complete TOML file with all fields', () => {
        const filePath = join(TMP_DIR, 'valid-complete.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "test"
action = "translate"
translation = "测试"
reason = "test 翻译为测试"`;
        writeFileSync(filePath, content);

        const result = validateTOML(filePath);
        expect(result).toBe(true);
      });

      it('should validate a TOML file with keep action', () => {
        const filePath = join(TMP_DIR, 'valid-keep.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "skill"
action = "keep"
translation = "skill"
reason = "skill 保留原文"`;
        writeFileSync(filePath, content);

        const result = validateTOML(filePath);
        expect(result).toBe(true);
      });

      it('should validate a TOML file without reason field', () => {
        const filePath = join(TMP_DIR, 'valid-no-reason.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "test"
action = "translate"
translation = "测试"`;
        writeFileSync(filePath, content);

        const result = validateTOML(filePath);
        expect(result).toBe(true);
      });

      it('should validate a TOML file with multiple rules', () => {
        const filePath = join(TMP_DIR, 'valid-multiple.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "bug"
action = "translate"
translation = "缺陷"
reason = "bug 翻译为缺陷"

[[rules]]
term = "commit"
action = "translate"
translation = "提交"
reason = "commit 翻译为提交"`;
        writeFileSync(filePath, content);

        const result = validateTOML(filePath);
        expect(result).toBe(true);
      });
    });

    describe('invalid TOML files', () => {
      it('should throw error when missing domain field', () => {
        const filePath = join(TMP_DIR, 'invalid-no-domain.toml');
        const content = `description = "测试术语表"

[[rules]]
term = "test"
action = "translate"
translation = "测试"`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/缺少必需的 "domain" 字段/);
      });

      it('should throw error when missing rules array', () => {
        const filePath = join(TMP_DIR, 'invalid-no-rules.toml');
        const content = `domain = "test"
description = "测试术语表"`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/缺少必需的 \[\[rules\]\] 数组定义/);
      });

      it('should throw error when rule has no rules', () => {
        const filePath = join(TMP_DIR, 'invalid-empty-rules.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/\[\[rules\]\] 数组中没有任何规则定义/);
      });

      it('should throw error when rule missing term field', () => {
        const filePath = join(TMP_DIR, 'invalid-no-term.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
action = "translate"
translation = "测试"`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/第 1 条规则错误：缺少必需的 "term" 字段/);
      });

      it('should throw error when rule missing action field', () => {
        const filePath = join(TMP_DIR, 'invalid-no-action.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "test"
translation = "测试"`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/第 1 条规则错误：缺少必需的 "action" 字段/);
      });

      it('should throw error when action is not keep or translate', () => {
        const filePath = join(TMP_DIR, 'invalid-action.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "test"
action = "invalid"
translation = "测试"`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/"action" 字段值必须是 "keep" 或 "translate"，当前值为 "invalid"/);
      });

      it('should throw error when action is translate but translation is missing', () => {
        const filePath = join(TMP_DIR, 'invalid-missing-translation.toml');
        const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "test"
action = "translate"`;
        writeFileSync(filePath, content);

        expect(() => validateTOML(filePath)).toThrow(/当 action 为 "translate" 时，"translation" 字段不能为空/);
      });
    });
  });

  describe('validateGlossaryFile', () => {
    beforeEach(() => {
      if (!existsSync(TMP_DIR)) {
        mkdirSync(TMP_DIR, { recursive: true });
      }
    });

    afterEach(() => {
      if (existsSync(TMP_DIR)) {
        const { readdirSync } = require('fs');
        const files = readdirSync(TMP_DIR);
        files.forEach(file => {
          rmSync(join(TMP_DIR, file), { recursive: true, force: true });
        });
      }
    });

    it('should validate CSV file correctly', () => {
      const filePath = join(TMP_DIR, 'glossary.csv');
      const content = 'term,action,translation,reason\nbug,translate,缺陷,bug 翻译为缺陷';
      writeFileSync(filePath, content);

      const result = validateGlossaryFile(filePath);
      expect(result).toBe(true);
    });

    it('should validate TOML file correctly', () => {
      const filePath = join(TMP_DIR, 'glossary.toml');
      const content = `domain = "test"
description = "测试术语表"

[[rules]]
term = "test"
action = "translate"
translation = "测试"`;
      writeFileSync(filePath, content);

      const result = validateGlossaryFile(filePath);
      expect(result).toBe(true);
    });

    it('should throw error when file does not exist', () => {
      const filePath = join(TMP_DIR, 'non-existent.csv');

      expect(() => validateGlossaryFile(filePath)).toThrow(/术语表文件不存在/);
    });

    it('should throw error for unsupported file format', () => {
      const filePath = join(TMP_DIR, 'glossary.txt');
      writeFileSync(filePath, 'test content');

      expect(() => validateGlossaryFile(filePath)).toThrow(/仅支持 \.csv 和 \.toml 格式/);
    });
  });
});
