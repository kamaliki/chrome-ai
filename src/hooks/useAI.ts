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
        systemPrompt: 'You are a helpful assistant that creates concise summaries.',
        // Removed outputLanguage as it is not part of the expected type
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

  const rewriteText = useCallback(async (text: string, tone = 'professional'): Promise<{result: string, explanation: string}> => {
    if (!text.trim()) return {result: text, explanation: 'No text provided'};
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAIAvailable()) {
        return {result: text, explanation: 'Chrome AI not available'};
      }
      
      const model = await createLanguageModel({
        systemPrompt: 'You are a helpful assistant that rewrites text and explains changes.',
        //outputLanguage: 'en'
      });
      const response = await model.prompt(`Rewrite this text in a ${tone} tone and then explain what you changed and why:\n\nOriginal: ${text}`);
      model.destroy();
      
      // Split response into result and explanation
      const parts = response.split('**Here\'s what I changed');
      const result = parts[0].trim();
      const explanation = parts.length > 1 ? '**Here\'s what I changed' + parts[1] : 'Text rewritten successfully';
      
      return {result, explanation};
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to rewrite';
      setError(errorMsg);
      return {result: text, explanation: `Error: ${errorMsg}`};
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
      
      const outputLang = targetLang === 'es' ? 'es' : targetLang === 'ja' ? 'ja' : 'en';
      const model = await createLanguageModel({
        systemPrompt: 'You are a helpful translator.',
        //outputLanguage: outputLang
      });
      const response = await model.prompt(`Translate this text to ${targetLang} and return ONLY the translated text without any explanations: ${text}`);
      model.destroy();
      
      // Extract clean translation by removing common explanation patterns
      let cleanResult = response;
      if (response.includes('**')) {
        const match = response.match(/\*\*(.*?)\*\*/s);
        if (match) cleanResult = match[1].trim();
      }
      if (cleanResult.includes('Here\'s')) {
        cleanResult = cleanResult.split('Here\'s')[0].trim();
      }
      if (cleanResult.toLowerCase().includes('translation')) {
        const lines = cleanResult.split('\n');
        cleanResult = lines.find(line => !line.toLowerCase().includes('translation') && line.trim()) || cleanResult;
      }
      
      return cleanResult.trim();
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
        systemPrompt: 'You are a helpful assistant that creates motivational prompts and questions.',
        //outputLanguage: 'en'
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
    
    try {
      if (!isAIAvailable()) {
        if (input.image) return 'Image uploaded - Chrome AI not available.';
        if (input.audio) return 'Audio recorded - Chrome AI not available.';
        return input.text || 'No content to process';
      }
      
      // Build content array for multimodal input
      const content = [];
      
      if (input.text) {
        content.push({ type: 'text', value: input.text });
      }
      
      if (input.image && input.audio) {
        // Combined image + audio processing
        content.push(
          { type: 'text', value: 'Extract text from this image and transcribe the audio. Combine into organized notes.' },
          { type: 'image', value: input.image },
          { type: 'audio', value: await input.audio.arrayBuffer() }
        );
      } else if (input.image) {
        // Image-only processing
        content.push(
          { type: 'text', value: 'Extract all text from this image' },
          { type: 'image', value: input.image }
        );
      } else if (input.audio) {
        // Audio-only processing
        console.log('Processing audio file:', {
          name: input.audio.name,
          size: input.audio.size,
          type: input.audio.type
        });
        
        const arrayBuffer = await input.audio.arrayBuffer();
        console.log('Audio arrayBuffer size:', arrayBuffer.byteLength);
        
        content.push(
          { type: 'text', value: 'Transcribe this audio and format as clear notes' },
          { type: 'audio', value: arrayBuffer }
        );
      }
      
      if (!content.length) {
        return 'No content provided';
      }
      
      // Determine expected inputs
      const expectedInputs = [];
      if (input.image) expectedInputs.push({ type: 'image' });
      if (input.audio) expectedInputs.push({ type: 'audio' });
      expectedInputs.push({ type: 'text' });
      
      const session = await createLanguageModel({
        expectedInputs,
        temperature: 0.1,
        //outputLanguage: 'en'
      });
      
      const result = await session.prompt([{ role: 'user', content }]);
      session.destroy();
      return result;
      
    } catch (err) {
      console.error('Multimodal processing error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Processing failed';
      setError(errorMsg);
      
      // Handle specific audio transcription unavailability
      if (input.audio && errorMsg.includes('Model capability is not available')) {
        return `🎤 Audio recorded successfully (${Math.round(input.audio.size / 1024)}KB)\n\n⚠️ Audio transcription is not yet available in this Chrome build.\n\nThe multimodal audio feature is still experimental. Your audio was recorded but transcription requires a newer Chrome version with full multimodal support.\n\nFor now, you can use this as a voice memo placeholder.`;
      }
      
      if (input.image) return 'Image processed (fallback mode)';
      if (input.audio) return 'Audio processed (fallback mode)';
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