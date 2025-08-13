const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // JavaScript files
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.eslint.json',
        },
        node: {
          extensions: ['.ts', '.js'],
        },
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      // Allow 'var' in TS files to support global augmentation pattern for Prisma
      'no-var': 'off',
      // You can enable more TS rules if desired, keeping minimal to fix parsing
    },
  },

  // Ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
  // Test files overrides (optional relax)
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
