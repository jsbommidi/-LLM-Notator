// Archive API for PostgreSQL database worker
const ARCHIVE_API_BASE_URL = process.env.NEXT_PUBLIC_ARCHIVE_API_URL || 'http://localhost:9848';

export interface ArchiveItem {
  id: number;
  prompt: string;
  response: string;
  error_category: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateArchiveRequest {
  prompt: string;
  response: string;
  error_categories: string[];
  notes: string;
}

export interface ArchiveResponse {
  archives: ArchiveItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchResponse extends ArchiveResponse {
  query: string;
}

class ArchiveApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ArchiveApiError';
  }
}

async function fetchArchiveApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${ARCHIVE_API_BASE_URL}${endpoint}`;
  
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
    throw new ArchiveApiError(response.status, errorMessage);
  }

  return response.json();
}

export const archiveApi = {
  // Health check
  healthCheck: (): Promise<{ status: string; timestamp: string }> => {
    return fetchArchiveApi<{ status: string; timestamp: string }>('/health');
  },

  // Get all archives with pagination
  getArchives: (page: number = 1, limit: number = 20): Promise<ArchiveResponse> => {
    return fetchArchiveApi<ArchiveResponse>(`/archives?page=${page}&limit=${limit}`);
  },

  // Get specific archive by ID
  getArchive: (id: number): Promise<ArchiveItem> => {
    return fetchArchiveApi<ArchiveItem>(`/archives/${id}`);
  },

  // Create new archive
  createArchive: (data: CreateArchiveRequest): Promise<{ message: string; archive: ArchiveItem }> => {
    return fetchArchiveApi('/archives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing archive
  updateArchive: (id: number, data: Partial<CreateArchiveRequest>): Promise<{ message: string; archive: ArchiveItem }> => {
    return fetchArchiveApi(`/archives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete archive
  deleteArchive: (id: number): Promise<{ message: string }> => {
    return fetchArchiveApi(`/archives/${id}`, {
      method: 'DELETE',
    });
  },

  // Search archives
  searchArchives: (query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    return fetchArchiveApi<SearchResponse>(`/archives/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
  },
};

export { ArchiveApiError }; 