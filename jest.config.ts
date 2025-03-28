export default {
  roots: ['./src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^queries/(.*)$': '<rootDir>/src/queries/$1',
    '^store/(.*)$': '<rootDir>/src/store/$1',
    '^styles/(.*)$': '<rootDir>/src/styles/$1',
  },
};
