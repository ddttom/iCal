module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'lib/**/*.js',
        'index.js',
        'server.js'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testMatch: ['**/test/**/*.test.js'],
    verbose: true,
    transformIgnorePatterns: [
        'node_modules/(?!(uuid)/)'
    ]
};
