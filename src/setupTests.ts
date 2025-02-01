import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Add this to ensure window object is available
if (typeof window === 'undefined') {
  global.window = {} as any;
}

// Mock localStorage with all required Storage interface properties
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn((index: number) => ''),
    // Add these to satisfy the Storage interface
    [Symbol.iterator]: function* () {
      yield* Object.entries(store);
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Clear localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
}); 