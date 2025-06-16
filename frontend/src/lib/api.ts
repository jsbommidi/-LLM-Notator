import { Example, AnnotationRequest } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export const api = {
  // Get all examples
  getExamples: (): Promise<Example[]> => {
    return fetchApi<Example[]>('/examples');
  },

  // Submit annotation
  submitAnnotation: (annotation: AnnotationRequest): Promise<{ message: string; id: string }> => {
    return fetchApi('/annotations', {
      method: 'POST',
      body: JSON.stringify(annotation),
    });
  },

  // Export annotations (returns blob for file download)
  exportAnnotations: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/export`);
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to export annotations');
    }
    
    return response.blob();
  },

  // Health check
  healthCheck: (): Promise<{ status: string }> => {
    return fetchApi<{ status: string }>('/health');
  },
};

export { ApiError }; 