import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  timeout: 5000
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
