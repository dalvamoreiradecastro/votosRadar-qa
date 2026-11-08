// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Catches a missing `await` on Playwright actions and assertions
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Fixed waits make tests slow and flaky; wait for a condition instead
      'playwright/no-wait-for-timeout': 'error',
      // Committed test.only would silently skip the rest of the suite
      'playwright/no-focused-test': 'error',
      // Conditional skips (e.g. desktop-only behavior) are intentional
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
    },
  },
);
