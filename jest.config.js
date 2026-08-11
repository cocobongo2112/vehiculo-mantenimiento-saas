module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit', '<rootDir>/tests/integration'],
  collectCoverageFrom: [
    'src/services/**/*.js',
    'src/controllers/**/*.js',
    '!src/controllers/**/reportes.controller.js'
  ],
  coverageDirectory: 'qa-reports/jest-coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
  }
};
