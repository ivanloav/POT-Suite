import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    const refreshClient = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((res) => res.data.token)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};
