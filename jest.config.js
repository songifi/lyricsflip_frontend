const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@dojoengine/create-burner$': '<rootDir>/src/__mocks__/types.ts',
    '^@dojoengine/core$': '<rootDir>/src/__mocks__/dojoCore.ts'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@dojoengine)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  }
}

module.exports = createJestConfig(customJestConfig)