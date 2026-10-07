import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://ustad-backend-production-eba9.up.railway.app/api';
export const TOKEN_KEY = 'ustad_admin_token';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach the admin token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is bad/expired, drop it and tell the app to show the login screen.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/admin-auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('ustad-logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
