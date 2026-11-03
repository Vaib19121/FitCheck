import axios, { isAxiosError } from 'axios';

import { API_BASE_URL } from '../config';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // Expired or revoked session: drop it so the app returns to signed-out state.
    if (isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearToken();
    }
    return Promise.reject(error);
  },
);

/** Best-effort human readable message from an API or network error. */
export function getErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (!error.response) {
      return 'Network error. Check your connection and try again.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
