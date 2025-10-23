declare global {
  interface Window {
    LanguageModel?: {
      create(options?: {
        temperature?: number;
        topK?: number;
        initialPrompts?: Array<{ role: string; content: string | Array<{type: string; value: any}> }>;
        expectedInputs?: Array<{ type: string }>;
      }): Promise<{
        prompt(input: string | Array<{ role: string; content: Array<{type: string; value: any}> }>): Promise<string>;
        promptStreaming(input: string | Array<{ role: string; content: Array<{type: string; value: any}> }>): AsyncIterable<string>;
        countPromptTokens?(input: string): Promise<number>;
        measureInputUsage?(input: string): Promise<number>;
        destroy(): void;
        temperature: number;
        topK: number;
        maxTokens?: number;
        tokensSoFar?: number;
        inputQuota?: number;
        inputUsage?: number;
      }>;
      params(): Promise<{
        defaultTopK: number;
        maxTopK: number;
        defaultTemperature: number;
        maxTemperature: number;
      }>;
    };
  }
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
}

export interface TimerSession {
  id: string;
  duration: number;
  completedAt: Date;
  notes?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  timerDuration: number;
}