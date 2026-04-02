import axios from 'axios';

import { env } from '../config/env';

export interface ApiErrorPayload {
  code?: string;
  details?: unknown;
  error?: string;
  message?: string;
}

export interface ApiError {
  code?: string;
  details?: unknown;
  message: string;
  status: number;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const responseData = error.response?.data;
    const message =
      responseData?.message ||
      responseData?.error ||
      error.message ||
      'An unexpected API error occurred.';

    return {
      status: error.response?.status ?? 0,
      message,
      code: responseData?.code ?? error.code,
      details: responseData?.details ?? responseData,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
    };
  }

  return {
    status: 0,
    message: 'An unknown error occurred.',
  };
}

apiClient.interceptors.request.use(
  (config) => {
    // Future auth header or token injection can be handled here.
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error)),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error);
    console.error('[API]', normalizedError.message, normalizedError);
    return Promise.reject(normalizedError);
  },
);

export async function resolveMock<TResponse>(data: TResponse): Promise<TResponse> {
  return Promise.resolve(data);
}
