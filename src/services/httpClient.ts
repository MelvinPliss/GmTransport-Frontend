import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;

function isRetryable(error: AxiosError): boolean {
  if (!error.response) return true; // network error
  const status = error.response.status;
  return status === 429 || status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retryCount?: number };
      config._retryCount = config._retryCount ?? 0;

      if (isRetryable(error) && config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const backoff = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);
        await delay(backoff);
        return client(config);
      }

      return Promise.reject(parseApiError(error));
    }
  );

  return client;
}

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return { kind: 'timeout', message: 'La solicitud tardó demasiado. Intenta de nuevo.' };
    }
    if (!error.response) {
      return { kind: 'network', message: 'Sin conexión. Verifica tu red e intenta de nuevo.' };
    }
    const status = error.response.status;
    const data = error.response.data as { message?: string; errors?: Record<string, string> };

    if (status === 422 && data.errors) {
      return { kind: 'validation', errors: data.errors };
    }
    if (status >= 400 && status < 500) {
      return { kind: 'server', message: data.message ?? 'Solicitud inválida.', status };
    }
    if (status >= 500) {
      return { kind: 'server', message: 'Error del servidor. Intenta de nuevo más tarde.', status };
    }
  }
  return { kind: 'unknown', message: 'Ocurrió un error inesperado.' };
}

export const httpClient = createHttpClient();
