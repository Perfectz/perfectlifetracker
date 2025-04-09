# Code Quality Tools

This project utilizes ESLint and Prettier to maintain code quality and consistent formatting across the codebase.

## ESLint

ESLint is a static code analysis tool that helps identify and fix problems in JavaScript and TypeScript code. Our configuration extends the recommended settings for React and TypeScript.

### Configuration

- `.eslintrc` - Contains the main ESLint configuration
- `.eslintignore` - Specifies files and directories to be excluded from linting

### Key Features

- Environment configured for browser, Node.js, and ES2021
- Extends ESLint recommended, React recommended, and TypeScript recommended rules
- Integration with Prettier to avoid formatting conflicts
- TypeScript parsing support
- Auto-detection of React version

### Usage

```bash
# Run ESLint to check for issues
npm run lint

# Run ESLint and attempt to fix issues automatically
npm run lint:fix
```

## Prettier

Prettier is an opinionated code formatter that enforces a consistent style by parsing your code and reprinting it.

### Configuration

- `.prettierrc` - Contains the Prettier formatting preferences
- `.prettierignore` - Specifies files and directories to exclude from formatting

### Formatting Preferences

- Single quotes for strings
- Semicolons at the end of statements
- 2-space indentation
- Trailing commas where possible (ES5 compatible)
- Maximum line width of 100 characters
- Consistent arrow function parentheses
- Automatic end-of-line sequence

### Usage

```bash
# Format all files in the src directory
npm run format

# Check if files are properly formatted without making changes
npm run format:check
```

## Pre-commit Hooks (Future Enhancement)

In the future, we may consider adding pre-commit hooks using Husky to automatically run ESLint and Prettier before each commit.

## VS Code Integration

For VS Code users, we recommend installing the ESLint and Prettier extensions and configuring your editor to:

1. Format code using Prettier on save
2. Show ESLint errors and warnings in real-time

Example VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
``` 