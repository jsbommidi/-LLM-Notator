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