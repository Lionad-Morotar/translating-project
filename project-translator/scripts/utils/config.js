const fs = require('fs');
const path = require('path');

/**
 * 加载项目配置文件
 * @param {string} projectPath - 项目路径
 * @returns {Object} 配置对象
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

  const defaultConfigPath = path.join(__dirname, '..', '..', 'configs', 'setting.json');
  try {
    const content = fs.readFileSync(defaultConfigPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`警告: 无法加载默认配置文件 ${defaultConfigPath}: ${error.message}`);
    return getDefaultConfig();
  }
}

/**
 * 获取默认配置
 * @returns {Object} 默认配置对象
 */
function getDefaultConfig() {
  return {
    targetLanguage: "中文",
    taskTrackingFile: ".todo/project-translation-task.md",
    fileFilters: {
      supportedExtensions: [".md", ".py", ".js", ".ts", ".tsx", ".jsx"],
      excludeFiles: ["LICENSE", "COPYRIGHT"],
      excludeDirs: ["__pycache__", ".git", ".node_modules"]
    },
    translation: {
      priority: ["README.md", "CONTRIBUTING.md", "docs/", "src/"],
      previewLines: 20
    }
  };
}

module.exports = {
  loadConfig,
  getDefaultConfig
};
