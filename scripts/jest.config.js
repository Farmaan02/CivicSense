export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(mongodb-memory-server|supertest)/)',
  ],
  testMatch: [
    '**/tests/**/*.spec.js',
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/uploads/**'
  ],
  // Increase default timeout for all tests
  testTimeout: 15000,
  // Use babel to transform ES modules
  globals: {
    'babel-jest': {
      babelrc: false,
      configFile: false,
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }
  }
}