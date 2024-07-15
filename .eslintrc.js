module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: [
        'react',
        'simple-import-sort',
        'jsx-a11y',
        'promise',
        'sonarjs',
        'unicorn',
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        'prettier',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:promise/recommended',
        'plugin:sonarjs/recommended-legacy',
    ],
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx', '*'],
            rules: {
                'simple-import-sort/imports': [
                    'error',
                    {
                        groups: [
                            ['^react', '^@?\\w'],
                            ['^(@|components)(/.*|$)'],
                            ['^\\u0000'],
                            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                            ['^.+\\.?(css)$'],
                        ],
                    },
                ],
            },
        },
    ],

    rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'no-undef': 0,
        'react/react-in-jsx-scope': 0,
        'no-unused-vars': 0,
        'react-hooks/exhaustive-deps': 0,
        'sonarjs/no-collapsible-if': 0,
        '@typescript-eslint/no-unused-vars': 0,
        'react-hooks/rules-of-hooks': 0,
        'sonarjs/no-identical-expressions': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/ban-types': 0,
        'padding-line-between-statements': [
            'warn',
            { blankLine: 'always', prev: '*', next: 'block' },
            { blankLine: 'always', prev: 'block', next: '*' },
            { blankLine: 'always', prev: '*', next: 'block-like' },
            { blankLine: 'always', prev: 'block-like', next: '*' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: 'directive', next: '*' },
            { blankLine: 'always', prev: ['const', 'let'], next: '*' },
            {
                blankLine: 'any',
                prev: ['singleline-const', 'singleline-let'],
                next: ['singleline-const', 'singleline-let'],
            },
            { blankLine: 'always', prev: ['case', 'default'], next: '*' },
            { blankLine: 'always', prev: '*', next: 'export' },
        ],
    },
};
