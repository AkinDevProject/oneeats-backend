/** @type {import('jest').Config} */
module.exports = {
  // Ne pas utiliser jest-expo preset qui a des problèmes de compatibilité
  // Utiliser une configuration manuelle à la place
  testEnvironment: 'node',

  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],

  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}'
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/.maestro/'
  ],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },

  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|expo-.*|@unimodules|unimodules|react-native-.*|@react-navigation|lucide-react-native)/)'
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock react-native pour eviter le chargement des modules natifs
    '^react-native$': '<rootDir>/tests/mocks/react-native.js',
    // Mock les assets
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/mocks/fileMock.js'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!src/types/**',
    '!src/config/**'
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  coverageReporters: ['text', 'lcov', 'html'],

  globals: {
    __DEV__: true
  },

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Ignorer les warnings de deprecation
  silent: false,
  verbose: true
};
