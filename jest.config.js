module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/node_modules/**',
    '!server/coverage/**'
  ],
  testMatch: [
    '**/tests/client/**/*.test.js',
    '**/tests/server/**/*.test.js'
  ],
  verbose: true,
  moduleNameMapper: {
    '^@scalar/express-api-reference$': '<rootDir>/tests/server/__mocks__/@scalar/express-api-reference.js'
  },
  testTimeout: 10000,
  forceExit: true
};
