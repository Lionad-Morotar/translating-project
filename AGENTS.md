# AGENTS.md

This file provides guidelines for AI agents working in this repository.

## Project Overview

Project Translator is a Node.js tool for batch translating project documentation and code files to Chinese. It scans projects, generates translation task lists, handles Git conflict resolution, and supports terminology glossaries.

## Build, Lint, and Test Commands

### Running Tests

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once (CI mode)
npm run test:coverage # Run tests with coverage report
```

### Running a Single Test

```bash
npm run test:run -- validator.test.js  # Run all tests in a file
npm run test:run -- -t "should validate a complete CSV file"  # Run specific test
```

### Project Scripts

Scripts are located in `project-translator/scripts/` and are run with Node.js directly:

```bash
node scripts/scan-files.js --project-path /path/to/project
node scripts/read-file.js --file-path /path/to/file --max-lines 20
node scripts/write-file.js --file-path /path/to/file --content "content"
node scripts/update-todo.js --project-path /path --file-path file.md --status pending
```

## Code Style Guidelines

### Language and Modules

- Main codebase uses **CommonJS** (`require`) - do not convert to ESM
- Test files use **ESM** (`import`) - match existing test patterns
- Use Chinese for comments and error messages to support Chinese-speaking users

### File Organization

- Utility functions go in `project-translator/scripts/utils/`
- Each utility file exports an object with related functions
- Index file (`utils/index.js`) re-exports all utilities via spread syntax
- CLI scripts go directly in `scripts/` directory

### Naming Conventions

- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` when truly constant
- Filenames: `kebab-case.js` for scripts, `camelCase.js` for utilities

### Function Documentation

Every function should have JSDoc comments:

```javascript
/**
 * Function description
 * @param {string} paramName - Parameter description
 * @param {number} paramName - Parameter description
 * @returns {boolean} Return value description
 * @throws {Error} When validation fails
 */
```

### Error Handling

- Wrap potentially failing operations in try-catch blocks
- Throw descriptive `Error` objects with Chinese messages
- Use `console.error()` for CLI argument validation errors
- Exit with `process.exit(1)` on fatal CLI errors
- Use `console.warn()` for non-critical warnings (e.g., missing optional fields)

### Import Patterns

```javascript
// Core Node.js modules
const fs = require('fs');
const path = require('path');

// Local utilities
const { func1, func2 } = require('./utils');
```

### String Handling

- Use template literals for string interpolation: `` `value: ${var}` ``
- Use Chinese punctuation for user-facing messages: `：`，`，`。`
- Include file paths in error messages for debugging

### Testing

- Use Vitest with `describe`, `it`, `expect` from 'vitest'
- Follow existing test structure: `tests/` directory mirrors `scripts/` structure
- Use `beforeEach`/`afterEach` for setup/teardown
- Clean up temporary files in `tmp/` directory after tests
- Test both valid and invalid inputs with descriptive test names

### Git Workflow

- This is a skill/project intended for agentic use
- Changes should be committed with clear, descriptive messages
- Consider the translation glossary (`references/glossary/`) when adding terminology

### Patterns to Avoid

- Do not convert CommonJS to ESM in the main codebase
- Do not use English-only error messages for user-facing output
- Do not mix tabs and spaces (existing files use 2-space indentation)
- Do not add new dependencies without discussion
