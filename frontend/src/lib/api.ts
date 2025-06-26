import { Example, AnnotationRequest, DataSource } from '@/types';

// This will be dynamically set based on settings
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9847';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If parsing error response fails, use default message
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// Function to update API base URL from settings
export const updateApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

// Function to fetch data from a data source
export const fetchFromDataSource = async (source: DataSource): Promise<Example[]> => {
  switch (source.type) {
    case 'file':
      // For file type, still use the backend API which handles file reading
      return fetchApi<Example[]>('/examples');
    
    case 'url':
      try {
        const response = await fetch(source.config.url!, {
          method: source.config.method || 'GET',
          headers: source.config.headers || {},
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response formats
        if (Array.isArray(data)) {
          return data;
        } else if (data.examples && Array.isArray(data.examples)) {
          return data.examples;
        } else if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else {
          throw new Error('Invalid response format from URL source');
        }
      } catch (error) {
        throw new Error(`Failed to fetch from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    
    case 'api':
      // For API type, this would need specific implementation based on the API
      // For now, fall back to the default endpoint
      return fetchApi<Example[]>('/examples');
    
    default:
      throw new Error(`Unsupported data source type: ${source.type}`);
  }
};

export const api = {
  // Get all examples (with configurable source)
  getExamples: (source?: DataSource): Promise<Example[]> => {
    if (source) {
      return fetchFromDataSource(source);
    }
    return fetchApi<Example[]>('/examples');
  },

  // Submit annotation
  submitAnnotation: (annotation: AnnotationRequest): Promise<{ message: string; id: string }> => {
    return fetchApi('/annotations', {
      method: 'POST',
      body: JSON.stringify(annotation),
    });
  },



  // Health check
  healthCheck: (): Promise<{ status: string }> => {
    return fetchApi<{ status: string }>('/health');
  },
};

export { ApiError }; 