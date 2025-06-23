import { AppSettings, DataSource } from '@/types';

// Default data sources
const defaultPromptSource: DataSource = {
  type: 'file',
  name: 'Local Examples File',
  description: 'Load prompts from local examples.jsonl file',
  config: {
    filePath: '/data/examples.jsonl',
    format: 'jsonl'
  }
};

const defaultResponseSource: DataSource = {
  type: 'file',
  name: 'Local Examples File',
  description: 'Load responses from local examples.jsonl file',
  config: {
    filePath: '/data/examples.jsonl',
    format: 'jsonl'
  }
};

// Default settings
export const defaultSettings: AppSettings = {
  promptSource: defaultPromptSource,
  responseSource: defaultResponseSource,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9847',
  autoRefresh: false,
  refreshInterval: 30,
  theme: 'auto',
  llm: {
    enabled: false,
    provider: 'lmstudio',
    baseUrl: 'http://127.0.0.1:1234',
    model: 'gemma-3-1b-it-qat',
  }
};

// Predefined data source templates
export const dataSourceTemplates: Record<string, DataSource> = {
  localFile: {
    type: 'file',
    name: 'Local File',
    description: 'Load data from a local file',
    config: {
      filePath: '/data/examples.jsonl',
      format: 'jsonl'
    }
  },
  openaiApi: {
    type: 'api',
    name: 'OpenAI API',
    description: 'Generate prompts/responses using OpenAI API',
    config: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      format: 'json',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    }
  },
  customUrl: {
    type: 'url',
    name: 'Custom URL',
    description: 'Fetch data from a custom URL endpoint',
    config: {
      url: '',
      method: 'GET',
      format: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  },
  huggingfaceApi: {
    type: 'api',
    name: 'Hugging Face API',
    description: 'Use Hugging Face Inference API',
    config: {
      endpoint: 'https://api-inference.huggingface.co/models/',
      format: 'json',
      headers: {
        'Authorization': 'Bearer YOUR_HF_TOKEN'
      }
    }
  }
};

// Settings storage functions
const SETTINGS_KEY = 'llm-notator-settings';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge with defaults to ensure all required fields exist
      const merged = {
        ...defaultSettings,
        ...parsed,
        // Ensure nested objects are properly merged
        promptSource: { ...defaultSettings.promptSource, ...parsed.promptSource },
        responseSource: { ...defaultSettings.responseSource, ...parsed.responseSource },
        llm: { ...defaultSettings.llm, ...parsed.llm },
      };

      // Validate and fix any data sources that might be invalid
      if (merged.promptSource.type === 'api' && !merged.promptSource.config.endpoint) {
        merged.promptSource = defaultSettings.promptSource;
      }
      if (merged.responseSource.type === 'api' && !merged.responseSource.config.endpoint) {
        merged.responseSource = defaultSettings.responseSource;
      }

      return merged;
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }

  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

export function resetSettings(): AppSettings {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SETTINGS_KEY);
  }
  return defaultSettings;
}

// Utility function to clear potentially corrupted settings
export function clearCorruptedSettings(): void {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Current stored settings:', parsed);
      }
      localStorage.removeItem(SETTINGS_KEY);
      console.log('Settings cleared. Refresh the page to load defaults.');
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  }
}

// Validation functions
export function validateDataSource(source: DataSource): string[] {
  const errors: string[] = [];

  if (!source.name.trim()) {
    errors.push('Name is required');
  }

  if (!source.type) {
    errors.push('Type is required');
  }

  switch (source.type) {
    case 'file':
      if (!source.config.filePath) {
        errors.push('File path is required for file type');
      }
      break;
    case 'url':
      if (!source.config.url) {
        errors.push('URL is required for URL type');
      } else {
        try {
          new URL(source.config.url);
        } catch {
          errors.push('Invalid URL format');
        }
      }
      break;
    case 'api':
      if (!source.config.endpoint) {
        errors.push('Endpoint is required for API type');
      }
      break;
  }

  return errors;
}

export function validateSettings(settings: AppSettings): string[] {
  const errors: string[] = [];

  const promptErrors = validateDataSource(settings.promptSource);
  if (promptErrors.length > 0) {
    errors.push(...promptErrors.map(e => `Prompt source: ${e}`));
  }

  const responseErrors = validateDataSource(settings.responseSource);
  if (responseErrors.length > 0) {
    errors.push(...responseErrors.map(e => `Response source: ${e}`));
  }

  if (!settings.apiBaseUrl) {
    errors.push('API base URL is required');
  } else {
    try {
      new URL(settings.apiBaseUrl);
    } catch {
      errors.push('Invalid API base URL format');
    }
  }

  if (settings.refreshInterval < 1) {
    errors.push('Refresh interval must be at least 1 minute');
  }

  return errors;
} 