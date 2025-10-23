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

  const processMultimodalInput = useCallback(async (input: { text?: string; image?: File; audio?: File }): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), 10000); // 10 second timeout
    });
    
    const processPromise = async (): Promise<string> => {
      if (!isAIAvailable()) {
        // Fallback for when AI is not available
        if (input.image) return 'Image uploaded - Chrome AI not available. Multimodal features require Chrome 127+ with AI flags enabled.';
        if (input.audio) return 'Audio recorded - Chrome AI not available. Multimodal features require Chrome 127+ with AI flags enabled.';
        return input.text || 'No content to process';
      }
      
      // Since multimodal AI isn't fully available yet, provide helpful fallbacks
      if (input.image) {
        try {
          const session = await createLanguageModel({
            expectedInputs: [{ type: 'image' }, { type: 'text' }]
          });
          
          const result = await session.prompt([
            {
              role: 'user',
              content: [
                { type: 'text', value: 'Extract all text from this image and format it as clear notes' },
                { type: 'image', value: input.image }
              ]
            }
          ]);
          
          session.destroy();
          return result;
        } catch (ocrError) {
          console.log('OCR failed:', ocrError);
          return 'Image uploaded successfully! Note: Text extraction requires Chrome 127+ with AI flags enabled.';
        }
      }
      
      if (input.audio) {
        try {
          const arrayBuffer = await input.audio.arrayBuffer();
          
          const session = await createLanguageModel({
            expectedInputs: [{ type: 'audio' }],
            temperature: 0.1
          });
          
          const result = await session.prompt([
            {
              role: 'user',
              content: [
                { type: 'text', value: 'Transcribe this audio' },
                { type: 'audio', value: arrayBuffer }
              ]
            }
          ]);
          
          session.destroy();
          return result;
        } catch (transcribeError) {
          console.log('Transcription failed:', transcribeError);
          return 'Audio recorded successfully! Note: Transcription requires Chrome 127+ with AI flags enabled.';
        }
      }
      
      // Regular text processing
      const model = await createLanguageModel();
      const result = await model.prompt(input.text || 'No content provided');
      model.destroy();
      return result;
    };
    
    try {
      const result = await Promise.race([processPromise(), timeoutPromise]);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process input';
      setError(errorMsg);
      console.error('Multimodal processing error:', err);
      
      // Return helpful fallback
      if (input.image) return 'Image uploaded successfully! \n\nNote: Full image analysis is coming soon with Chrome\'s multimodal AI updates.';
      if (input.audio) return 'Audio recorded successfully! \n\nNote: Full transcription is coming soon with Chrome\'s multimodal AI updates.';
      return 'Processing failed - please try again';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const proofreadText = useCallback(async (text: string) => {
    if (!text.trim()) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // @ts-ignore - Proofreader API is experimental
      if (!('Proofreader' in self)) {
        return null;
      }
      
      // @ts-ignore
      const proofreader = await self.Proofreader.create({
        includeCorrectionTypes: true,
        includeCorrectionExplanations: true,
        expectedInputLanguagues: ['en'],
        correctionExplanationLanguage: 'en'
      });
      
      const result = await proofreader.proofread(text);
      return result;
    } catch (err) {
      console.log('Proofreading failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Use a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.default
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    summarizeText,
    rewriteText,
    translateText,
    generatePrompt,
    processMultimodalInput,
    proofreadText,
    speakResponse,
    isLoading,
    error,
    isAIAvailable: isAIAvailable()
  };
};