import { Platform } from 'react-native';
import { Storage } from '../lib/storage';
import { ApiErrorResponse } from '../types/api';

/**
 * Resolve the appropriate base API URL.
 * Expo public env vars are prefixed with EXPO_PUBLIC_
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // Android emulator uses 10.0.2.2 to access host machine localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  // iOS Simulator and Web use localhost
  return 'http://localhost:4000';
}

export class ApiError extends Error {
  status: number;
  details?: Array<{ path: string; message: string }>;

  constructor(status: number, message: string, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = await Storage.getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      0,
      `Network connection failed. Unable to reach server at ${baseUrl}. Please check your connection or server status.`
    );
  }

  if (response.status === 401) {
    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
  }

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      const text = await response.text();
      responseData = { message: text };
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const errorBody = responseData as ApiErrorResponse | null;
    let errorMessage = errorBody?.error || response.statusText || 'Request failed';

    if (errorBody?.details && Array.isArray(errorBody.details) && errorBody.details.length > 0) {
      const detailMessages = errorBody.details.map((d) => d.message).join('. ');
      errorMessage = `${errorMessage}: ${detailMessages}`;
    }

    throw new ApiError(response.status, errorMessage, errorBody?.details);
  }

  return responseData as T;
}
