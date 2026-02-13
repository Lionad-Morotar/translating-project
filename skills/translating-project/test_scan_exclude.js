const FileScanner = require('./tools/lib/scanner');
const path = require('path');
const fs = require('fs');

// 创建一个临时测试目录
const testDir = '/tmp/test_scan_exclude_' + Date.now();
fs.mkdirSync(testDir, { recursive: true });
fs.mkdirSync(path.join(testDir, 'subdir'), { recursive: true });

// 创建一些测试文件
fs.writeFileSync(path.join(testDir, 'README.md'), '# Test');
fs.writeFileSync(path.join(testDir, 'LICENSE'), 'MIT');  // 应该被排除
fs.writeFileSync(path.join(testDir, 'normal.js'), 'const x = 1;');
fs.writeFileSync(path.join(testDir, 'subdir', 'nested.md'), '# Nested');

console.log('测试目录结构:');
console.log(fs.readdirSync(testDir, { recursive: true }));

// 配置：排除 LICENSE
const config = {
  fileFilters: {
    supportedExtensions: ['.md', '.js'],
    excludeFiles: ['LICENSE', 'COPYRIGHT'],  // 应该排除 LICENSE
    excludeDirs: ['node_modules', '.git']
  },
  translation: {
    langdetectMinLength: 3
  }
};

console.log('\n配置 excludeFiles:', config.fileFilters.excludeFiles);

async function test() {
  const scanner = new FileScanner(config);
  const files = await scanner.scan(testDir);
  
  console.log('\n扫描结果:');
  files.forEach(f => console.log(' -', path.basename(f.path)));
  
  // 验证 LICENSE 是否被排除
  const hasLicense = files.some(f => path.basename(f.path) === 'LICENSE');
  console.log('\n验证:');
  console.log('LICENSE 是否被排除:', !hasLicense);
  
  if (hasLicense) {
    console.log('✗ BUG: LICENSE 应该被排除但却被扫描了');
  } else {
    console.log('✓ 正确: LICENSE 已被排除');
  }
  
  // 清理
  fs.rmSync(testDir, { recursive: true });
}

test().catch(console.error);
