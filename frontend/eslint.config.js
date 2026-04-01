//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  ...tanstackConfig,
  {
    name: 'custom-rules',

    plugins: {
      perfectionist,
      'unused-imports': unusedImports,
    },

    rules: {
      // 🔥 ลบ import ที่ไม่ใช้
      'unused-imports/no-unused-imports': 'error',

      // ⚠️ เตือน variable ที่ไม่ใช้
      'unused-imports/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // console
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // 🔥 จัด import
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          newlinesBetween: 'always',
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          internalPattern: ['^@/.*'],
        },
      ],
    },
  },

  {
    name: 'test-overrides',
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
