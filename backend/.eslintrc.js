// based off of Practica Eslint configuration
module.exports = {
  env: {
    es2022: true,
    node: true
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['**/dist/*', '**/node_modules/*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: '2022',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort'],
  rules: {
    'no-nested-ternary': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': 'off',
    'no-shadow': 'off',
    'default-case': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'simple-import-sort/imports': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'prettier/prettier': [
      'error',
      {
        'endOfLine': 'auto'
      }
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/tests/**', '**/test/**'] }
    ],
    'no-console': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-return-await': 'off',
    'no-restricted-exports': 'off',
    'no-param-reassign': 'off',
    'no-use-before-define': 'off',
    'import/prefer-default-export': 'off'
  }
}
