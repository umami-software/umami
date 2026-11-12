import type { APIRequestContext } from '@playwright/test';
import { recordApiCall } from './coverage/recorder';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  /** JSON-serialised unless a string is given (sent verbatim). */
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  status: number;
  ok: boolean;
  /** Parsed JSON body, or undefined when the body is empty / not JSON. */
  body: T;
  text: string;
  headers: Record<string, string>;
}

/**
 * Thin wrapper over Playwright's APIRequestContext that carries default headers
 * (auth) and records every call for the coverage reporter. All specs must go
 * through this class — calls made with the raw `request` fixture are invisible
 * to coverage.
 */
export class ApiClient {
  constructor(
    private readonly context: APIRequestContext,
    private readonly headers: Record<string, string> = {},
  ) {}

  with(headers: Record<string, string>) {
    return new ApiClient(this.context, { ...this.headers, ...headers });
  }

  bearer(token: string) {
    return this.with({ authorization: `Bearer ${token}` });
  }

  async request<T = any>(
    method: HttpMethod,
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const params = options.params
      ? Object.fromEntries(
          Object.entries(options.params).filter(([, value]) => value !== undefined),
        )
      : undefined;

    const response = await this.context.fetch(path, {
      method,
      data: options.data,
      params: params as Record<string, string | number | boolean>,
      headers: { ...this.headers, ...options.headers },
    });

    recordApiCall(method, path);

    const text = await response.text();
    let body: any;

    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = undefined;
    }

    return {
      status: response.status(),
      ok: response.ok(),
      body,
      text,
      headers: response.headers(),
    };
  }

  get<T = any>(path: string, options?: ApiRequestOptions) {
    return this.request<T>('GET', path, options);
  }

  post<T = any>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>('POST', path, { ...options, data });
  }

  put<T = any>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>('PUT', path, { ...options, data });
  }

  del<T = any>(path: string, options?: ApiRequestOptions) {
    return this.request<T>('DELETE', path, options);
  }
}
