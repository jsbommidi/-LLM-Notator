export interface Example {
  id: string;
  prompt: string;
  response: string;
}

export interface Annotation {
  id: string;
  labels: string[];
  notes: string;
  timestamp: string;
}

export interface AnnotationRequest {
  id: string;
  labels: string[];
  notes: string;
}

export interface ErrorCategory {
  value: string;
  label: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DataSource {
  type: 'file' | 'url' | 'api';
  name: string;
  description: string;
  config: {
    // For file type
    filePath?: string;
    // For URL type
    url?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    // For API type
    endpoint?: string;
    apiKey?: string;
    // Common
    format?: 'jsonl' | 'json' | 'csv';
    refreshInterval?: number; // in minutes
  };
}

export interface AppSettings {
  promptSource: DataSource;
  responseSource: DataSource;
  apiBaseUrl: string;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  theme: 'light' | 'dark' | 'auto';
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
} 