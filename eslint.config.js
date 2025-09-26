const nextPlugin = require('@next/eslint-plugin-next')

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    },
    ignores: [
      '.next/*',
      'out/*',
      'node_modules/*',
      'dist/*',
      'build/*'
    ]
  }
]