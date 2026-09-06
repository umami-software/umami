export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface UmamiClientOptions {
  /**
   * API base URL. Defaults to Umami Cloud (`https://api.umami.is/v1`).
   * For self-hosted installs use your instance URL plus `/api`, e.g. `https://analytics.example.com/api`.
   */
  baseUrl?: string;
  /**
   * Bearer token: a login token from `POST /api/auth/login`, an OAuth access token, or a
   * self-hosted API key (`umami_…`).
   */
  token?: string;
  /**
   * Umami Cloud API key. Sent as `x-umami-api-key`. When no `token` is provided the key is also
   * sent as a bearer token so that self-hosted `umami_…` keys work with either option.
   */
  apiKey?: string;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Custom fetch implementation (testing, alternative runtimes, in-process dispatch). */
  fetch?: FetchLike;
  /** Per-request timeout in milliseconds. Disabled by default. */
  timeout?: number;
}

export interface RequestOptions {
  /** Extra headers for this request only. */
  headers?: Record<string, string>;
  /** Abort signal for this request. */
  signal?: AbortSignal;
}
