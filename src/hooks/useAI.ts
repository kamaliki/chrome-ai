import { useState, useCallback } from 'react';
import { createLanguageModel, isAIAvailable } from '../utils/chrome-ai';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarizeText = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAIAvailable()) {
        return `Summary: ${text.slice(0, 100)}...`;
      }
      
      const model = await createLanguageModel({
        systemPrompt: 'You are a helpful assistant that creates concise summaries.'
      });
      const summary = await model.prompt(`Summarize this text: ${text}`);
      model.destroy();
      return summary;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to summarize';
      setError(errorMsg);
      return `Summary: ${text.slice(0, 100)}...`;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rewriteText = useCallback(async (text: string, tone = 'professional'): Promise<string> => {
    if (!text.trim()) return text;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAIAvailable()) {
        return text;
      }
      
      const model = await createLanguageModel({
        systemPrompt: 'You are a helpful assistant that rewrites text to improve clarity and tone.'
      });
      const rewritten = await model.prompt(`Rewrite this text in a ${tone} tone: ${text}`);
      model.destroy();
      return rewritten;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to rewrite';
      setError(errorMsg);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateText = useCallback(async (text: string, targetLang: string): Promise<string> => {
    if (!text.trim()) return text;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAIAvailable()) {
        return text;
      }
      
      const model = await createLanguageModel({
        systemPrompt: 'You are a helpful translator.'
      });
      const translated = await model.prompt(`Translate this text to ${targetLang}: ${text}`);
      model.destroy();
      return translated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to translate';
      setError(errorMsg);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePrompt = useCallback(async (context: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAIAvailable()) {
        return "What's one thing you want to focus on today?";
      }
      
      const model = await createLanguageModel({
        systemPrompt: 'You are a helpful assistant that creates motivational prompts and questions.'
      });
      const prompt = await model.prompt(context);
      model.destroy();
      return prompt;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate prompt';
      setError(errorMsg);
      return "What's one thing you want to focus on today?";
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    summarizeText,
    rewriteText,
    translateText,
    generatePrompt,
    isLoading,
    error,
    isAIAvailable: isAIAvailable()
  };
};