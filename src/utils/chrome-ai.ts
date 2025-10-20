export const isAIAvailable = () => {
  return typeof window !== 'undefined' && 'LanguageModel' in window;
};

export const createLanguageModel = async (options?: {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
}) => {
  if (!isAIAvailable() || !window.LanguageModel) {
    throw new Error('LanguageModel API not available');
  }
  
  const initialPrompts = options?.systemPrompt ? [
    { role: 'system', content: options.systemPrompt }
  ] : [];
  
  return await window.LanguageModel.create({
    temperature: options?.temperature || 0.8,
    topK: options?.topK || 3,
    initialPrompts
  });
};

export const getModelParams = async () => {
  if (!isAIAvailable() || !window.LanguageModel) {
    return { defaultTopK: 3, maxTopK: 128, defaultTemperature: 0.8, maxTemperature: 2 };
  }
  return await window.LanguageModel.params();
};