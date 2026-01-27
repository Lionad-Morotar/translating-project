const config = require('./config');
const gitignore = require('./gitignore');
const fileFilter = require('./file-filter');
const todo = require('./todo');
const git = require('./git');
const validator = require('./validator');
const file = require('./file');
const parser = require('./parser');

module.exports = {
  ...config,
  ...gitignore,
  ...fileFilter,
  ...todo,
  ...git,
  ...validator,
  ...file,
  ...parser
};
