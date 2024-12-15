// @ts-check

import eslint from '@eslint/js'
import love from 'eslint-config-love'
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    ...love,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked
  },
  {
    rules: {
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': 'off'
    }
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'prefer-arrow-functions': preferArrowFunctions
    },
    rules: {
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prefer-arrow-functions/prefer-arrow-functions': 'error'
    }
  }
)
