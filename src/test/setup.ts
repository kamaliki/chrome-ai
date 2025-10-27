import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock Chrome AI APIs
beforeAll(() => {
  Object.defineProperty(window, 'ai', {
    value: {
      summarizer: {
        create: jest.fn().mockResolvedValue({
          summarize: jest.fn().mockResolvedValue('Test summary'),
          destroy: jest.fn(),
        }),
      },
      writer: {
        create: jest.fn().mockResolvedValue({
          write: jest.fn().mockResolvedValue('Test generated content'),
          destroy: jest.fn(),
        }),
      },
      rewriter: {
        create: jest.fn().mockResolvedValue({
          rewrite: jest.fn().mockResolvedValue('Test rewritten content'),
          destroy: jest.fn(),
        }),
      },
      translator: {
        create: jest.fn().mockResolvedValue({
          translate: jest.fn().mockResolvedValue('Test translated content'),
          destroy: jest.fn(),
        }),
      },
    },
    writable: true,
  });

  // Mock LanguageDetector
  Object.defineProperty(window, 'LanguageDetector', {
    value: {
      create: jest.fn().mockResolvedValue({
        detect: jest.fn().mockResolvedValue([{ detectedLanguage: 'en', confidence: 0.95 }]),
        destroy: jest.fn()
      })
    },
    writable: true,
  });

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});