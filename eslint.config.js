const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                // Jest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                beforeEach: 'readonly',
                afterAll: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-unused-vars': ['warn'],
            'no-console': 'off'
        }
    },
    // Browser files
    {
        files: ['public/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                window: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                FormData: 'readonly',
                console: 'readonly'
            }
        }
    },
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            '.nyc_output/**',
            'test-results/**',
            'dist/**',
            'build/**'
        ]
    }
];
