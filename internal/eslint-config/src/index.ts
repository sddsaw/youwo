import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import antfu from '@antfu/eslint-config'

export interface ESLintConfigOptions {
  unocss?: boolean
  vue?: boolean
  ignores?: string[]
  stylistic?: {
    indent?: number | 'tab'
    quotes?: 'single' | 'double'
  }
  overrides?: TypedFlatConfigItem[]
}

/**
 * Create ESLint configuration
 * Based on @antfu/eslint-config, supporting flexible configuration overrides
 */
export function createESLintConfig(options: ESLintConfigOptions = {}): ReturnType<typeof antfu> {
  const {
    unocss = true,
    vue = true,
    ignores = [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.md',
      '**/elegant/*.ts',
    ],
    stylistic = {
      indent: 2,
      quotes: 'single',
    },
    overrides = [],
  } = options

  return antfu(
    {
      unocss,
      vue,
      ignores,
      stylistic,
    },
    {
      // Vue file rules
      files: ['**/*.vue'],
      rules: {
        'vue/max-attributes-per-line': ['error', {
          singleline: 6,
          multiline: {
            max: 1,
          },
        }],
      },
    },
    {
      // TypeScript file rules
      files: ['**/*.ts'],
      rules: {},
    },
    {
      // Global rule overrides
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'node/prefer-global/process': 'off',
        'no-console': 'warn',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/ban-ts-comment': [
          'warn',
          { 'ts-ignore': false },
        ],
        'pnpm/json-enforce-catalog': 'off',
        'pnpm/yaml-enforce-settings': 'off',
        'pnpm/yaml-no-unused-catalog-item': 'off',
        'import/consistent-type-specifier-style': 'off',
      },
    },
    {
      files: ['packages/utils/src/**/*.{ts,vue}', '**/packages/utils/src/**/*.{ts,vue}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@sa/components',
                  '@sa/components/*',
                  '@sa/hooks',
                  '@sa/hooks/*',
                  '@sa/axios',
                  '@sa/axios/*',
                  '@sa/materials',
                  '@sa/materials/*',
                  '@apps/*',
                ],
                message: 'Low-level utility package `@sa/utils` cannot import from high-level packages (components, hooks, axios, materials, apps).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/axios/src/**/*.{ts,vue}', '**/packages/axios/src/**/*.{ts,vue}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@sa/components',
                  '@sa/components/*',
                  '@sa/hooks',
                  '@sa/hooks/*',
                  '@sa/materials',
                  '@sa/materials/*',
                  '@apps/*',
                ],
                message: 'Low-level API package `@sa/axios` cannot import from high-level packages (components, hooks, materials, apps).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/hooks/src/**/*.{ts,vue}', '**/packages/hooks/src/**/*.{ts,vue}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@sa/components',
                  '@sa/components/*',
                  '@sa/materials',
                  '@sa/materials/*',
                  '@apps/*',
                ],
                message: 'Low-level hooks package `@sa/hooks` cannot import from high-level packages (components, materials, apps).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/components/src/**/*.{ts,vue}', '**/packages/components/src/**/*.{ts,vue}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@apps/*',
                ],
                message: 'Shared components package `@sa/components` cannot import from applications (`@apps/*`).',
              },
            ],
          },
        ],
      },
    },
    ...overrides,
  )
}

export default createESLintConfig
