import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken')

      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  },
)

export default api

/**
 * Universal authenticated API call function
 * Automatically includes the Bearer token from localStorage
 *
 * @example
 * // GET request
 * const users = await authenticatedCall('/user')
 *
 * // POST request
 * const newUser = await authenticatedCall('/user', {
 *   method: 'POST',
 *   data: { name: 'John', email: 'john@example.com', password: '123456' }
 * })
 *
 * // DELETE request
 * await authenticatedCall('/auth/logout', { method: 'DELETE' })
 */
export async function authenticatedCall<T = any>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    data?: any
    params?: any
    headers?: Record<string, string>
  },
): Promise<T> {
  const { method = 'GET', data, params, headers } = options || {}

  const token = localStorage.getItem('authToken')

  const config = {
    method,
    url,
    data,
    params,
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }

  const response = await api.request<T>(config)
  return response.data
}

/**
 * Convenience methods for common HTTP operations
 */
export const apiClient = {
  get: <T = any>(url: string, params?: any) =>
    authenticatedCall<T>(url, { method: 'GET', params }),

  post: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'POST', data }),

  put: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'PUT', data }),

  patch: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'PATCH', data }),

  delete: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'DELETE', data }),
}
