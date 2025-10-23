export const isAIAvailable = () => {
  return typeof window !== 'undefined' && 'LanguageModel' in window;
};

export const createLanguageModel = async (options?: {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
  initialPrompts?: Array<{ role: string; content: string }>;
  expectedInputs?: Array<{ type: string }>;
}) => {
  if (!isAIAvailable() || !window.LanguageModel) {
    throw new Error('LanguageModel API not available');
  }
  
  let initialPrompts = options?.initialPrompts || [];
  if (options?.systemPrompt) {
    initialPrompts = [{ role: 'system', content: options.systemPrompt }, ...initialPrompts];
  }
  
  const createOptions: any = {
    temperature: options?.temperature || 0.8,
    topK: options?.topK || 3,
    initialPrompts
  };
  
  if (options?.expectedInputs) {
    createOptions.expectedInputs = options.expectedInputs;
  }
  
  return await window.LanguageModel.create(createOptions);
};

export const getModelParams = async () => {
  if (!isAIAvailable() || !window.LanguageModel) {
    return { defaultTopK: 3, maxTopK: 128, defaultTemperature: 0.8, maxTemperature: 2 };
  }
  return await window.LanguageModel.params();
};