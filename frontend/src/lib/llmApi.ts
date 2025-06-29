import { Example } from '@/types';

export interface LLMConfig {
  baseUrl: string;
  model: string;
  apiKey?: string; // Optional for local LM Studio
}

export interface LLMResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export interface ProgressCallbacks {
  onSending?: () => void;
  onWaiting?: () => void;
  onProcessing?: () => void;
}

class LLMApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'LLMApiError';
  }
}

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateResponse(prompt: string, callbacks?: ProgressCallbacks): Promise<string> {
    try {
      callbacks?.onSending?.();
      
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      callbacks?.onWaiting?.();

      if (!response.ok) {
        const errorText = await response.text();
        throw new LLMApiError(response.status, `LLM API error: ${errorText}`);
      }

      callbacks?.onProcessing?.();
      const data: LLMResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new LLMApiError(500, 'No response from LLM');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof LLMApiError) {
        throw error;
      }
      throw new LLMApiError(500, `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateExample(prompt: string, callbacks?: ProgressCallbacks): Promise<Example> {
    const response = await this.generateResponse(prompt, callbacks);
    
    return {
      id: `llm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: prompt,
      response: response
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create LLM service based on provider
export const createLLMService = (provider: 'ollama' | 'lmstudio', baseUrl: string, model: string, apiKey?: string): LLMService => {
  return new LLMService({
    baseUrl,
    model,
    apiKey,
  });
};

// Default configurations for different providers
export const getDefaultConfig = (provider: 'ollama' | 'lmstudio') => {
  switch (provider) {
    case 'ollama':
      return {
        baseUrl: 'http://localhost:11434',
        model: 'llama2',
      };
    case 'lmstudio':
      return {
        baseUrl: 'http://127.0.0.1:1234',
        model: 'gemma-3-1b-it-qat',
      };
    default:
      return {
        baseUrl: 'http://127.0.0.1:1234',
        model: 'gemma-3-1b-it-qat',
      };
  }
};

export { LLMApiError }; 