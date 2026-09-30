import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 10000,
});

let accessToken = null;
let unauthorizedHandler = null;

export function setApiAuth(token, onUnauthorized) {
  accessToken = token || null;
  unauthorizedHandler = onUnauthorized || null;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && accessToken && unauthorizedHandler) unauthorizedHandler();
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error, fallback) {
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return '';
  return error.response?.data?.message || fallback;
}

export default api;
