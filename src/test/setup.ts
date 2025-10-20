import { beforeAll, vi } from 'vitest'

// Mock Chrome AI APIs for testing
beforeAll(() => {
  Object.defineProperty(window, 'ai', {
    value: {
      summarizer: {
        create: vi.fn().mockResolvedValue({
          summarize: vi.fn().mockResolvedValue('Test summary'),
          destroy: vi.fn(),
        }),
      },
      writer: {
        create: vi.fn().mockResolvedValue({
          write: vi.fn().mockResolvedValue('Test generated content'),
          destroy: vi.fn(),
        }),
      },
      rewriter: {
        create: vi.fn().mockResolvedValue({
          rewrite: vi.fn().mockResolvedValue('Test rewritten content'),
          destroy: vi.fn(),
        }),
      },
      translator: {
        create: vi.fn().mockResolvedValue({
          translate: vi.fn().mockResolvedValue('Test translated content'),
          destroy: vi.fn(),
        }),
      },
    },
    writable: true,
  })
})