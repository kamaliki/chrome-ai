import { renderHook, act } from '@testing-library/react';
import { useAI } from '../hooks/useAI';

describe('useAI Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAI());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.summarizeText).toBe('function');
    expect(typeof result.current.translateText).toBe('function');
    expect(typeof result.current.detectLanguage).toBe('function');
  });

  it('summarizes text successfully', async () => {
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      const summary = await result.current.summarizeText('Test content to summarize');
      expect(summary).toBe('Test summary');
    });
  });

  it('translates text successfully', async () => {
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      const translation = await result.current.translateText('Hello', 'es');
      expect(translation).toBe('Test translated content');
    });
  });

  it('detects language successfully', async () => {
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      const detection = await result.current.detectLanguage('Hello world');
      expect(detection).toEqual({
        language: 'en',
        confidence: 0.95
      });
    });
  });

  it('handles AI unavailable gracefully', async () => {
    // Mock AI as unavailable
    Object.defineProperty(window, 'ai', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      const summary = await result.current.summarizeText('Test content');
      expect(summary).toContain('Summary: Test content');
    });
  });

  it('sets loading state during operations', async () => {
    const { result } = renderHook(() => useAI());
    
    act(() => {
      result.current.summarizeText('Test content');
    });
    
    expect(result.current.isLoading).toBe(true);
  });
});