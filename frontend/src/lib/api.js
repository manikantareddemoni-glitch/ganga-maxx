import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL;
if (!baseURL || baseURL.includes('127.0.0.1') || baseURL.includes('localhost')) {
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    baseURL = 'https://ganga-maxx-backend.onrender.com/api';
  } else {
    baseURL = baseURL || 'http://127.0.0.1:5000/api';
  }
}

export const api = axios.create({
  baseURL,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gmx_token');
  if (config.url === '/auth/refresh') {
      const refreshToken = localStorage.getItem('gmx_refresh_token');
      if (refreshToken) config.headers.Authorization = `Bearer ${refreshToken}`;
  } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (originalRequest.url === '/auth/refresh') {
        localStorage.removeItem('gmx_token');
        localStorage.removeItem('gmx_refresh_token');
        localStorage.removeItem('gmx_user');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }

    if (error.response && (error.response.status === 401 || error.response.status === 422) && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/google')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('gmx_token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export async function triggerBackendAction(action, payload = {}) {
  try {
    const { data } = await api.post('/actions', { action, ...payload });
    return data;
  } catch (error) {
    console.error(`Failed to trigger backend action: ${action}`, error);
    return null;
  }
}

// In-memory cache to eliminate loading delays when navigating between pages
const cache = new Map();

const originalGet = api.get;
api.get = async (url, config) => {
  // Strip timestamps from URL to ensure cache hits
  const cacheKey = url.replace(/&t=\d+/, '').replace(/\?t=\d+/, '');
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.time < 5 * 60 * 1000) { // 5 min TTL
      // Fetch fresh in background to silently update cache, but return instant cached response
      originalGet(url, config).then(res => cache.set(cacheKey, { data: res.data, time: Date.now() })).catch(() => {});
      return Promise.resolve({ data: cached.data, status: 200 });
    }
  }
  
  const response = await originalGet(url, config);
  cache.set(cacheKey, { data: response.data, time: Date.now() });
  return response;
};

// Clear cache on any data mutations to keep UI perfectly in sync
const clearCache = () => cache.clear();

const originalPost = api.post;
api.post = async (...args) => { clearCache(); return originalPost(...args); };

const originalPut = api.put;
api.put = async (...args) => { clearCache(); return originalPut(...args); };

const originalDelete = api.delete;
api.delete = async (...args) => { clearCache(); return originalDelete(...args); };

