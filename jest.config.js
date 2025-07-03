module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['<rootDir>/src/setup/localStorage.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '\.(css|less|scss|sass)
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
: 'identity-obj-proxy',
  },
  testMatch: [
    "<rootDir>/src/__tests__/**/*.test.ts",
    "<rootDir>/src/__tests__/**/*.test.tsx"
  ],
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
