import axios from 'axios';

const BASE_URL = 'https://ustad-backend-production-eba9.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;