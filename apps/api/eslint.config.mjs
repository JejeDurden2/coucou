import nestjsConfig from '@coucou-ia/config/eslint/nestjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nestjsConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.eslintrc.js',
      'prisma.config.ts',
      'prisma/**',
    ],
  },
];
