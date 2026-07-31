export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export const apiClient = {
  setToken: (token: string | null) => { _token = token; },
  onUnauthorized: (cb: () => void) => { _onUnauthorized = cb; },
  get: <T>(url: string, options?: FetchOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data?: any, options?: FetchOptions) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data?: any, options?: FetchOptions) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string, options?: FetchOptions) => request<T>(url, { ...options, method: 'DELETE' }),
  patch: <T>(url: string, data?: any, options?: FetchOptions) => request<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
};

async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  
  let fetchUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fetchUrl = `${url}?${searchParams.toString()}`;
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (_token) {
    headers.set('Authorization', `Bearer ${_token}`);
  }

  const response = await fetch(fetchUrl, { ...init, headers });

  if (!response.ok) {
    if (response.status === 401 && _onUnauthorized && !fetchUrl.includes('/api/auth/login')) {
      _onUnauthorized();
    }
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse error on non-ok responses
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const responseData = await response.json();
  
  // Unwrap standard backend response format { success: true, data: ... }
  if (responseData && typeof responseData === 'object' && 'success' in responseData) {
    if (responseData.success) {
      return responseData.data as T;
    } else {
      throw new ApiError(response.status, responseData.error?.message || response.statusText, responseData.error);
    }
  }

  return responseData as T;
}
