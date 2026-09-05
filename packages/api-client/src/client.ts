import {
  GeneratedUmamiClient,
  type OperationId,
  type OperationInput,
  type OperationOutput,
  operations,
} from './generated/operations';
import {
  API_KEY_HEADER,
  buildAuthHeaders,
  buildPath,
  buildUrl,
  DEFAULT_BASE_URL,
  resolveFetch,
  sendRequest,
  splitInput,
  trimSlashes,
} from './http';
import type { FetchLike, RequestOptions, UmamiClientOptions } from './types';

type Input<K extends OperationId> = OperationInput<K>;
type Output<K extends OperationId> = Promise<OperationOutput<K>>;
type Params<K extends OperationId, P extends string> = Omit<OperationInput<K>, P>;

function positional<K extends OperationId>(
  key: string,
  first: string | Input<K>,
  second?: Record<string, unknown> | RequestOptions,
  third?: RequestOptions,
): [Input<K>, RequestOptions | undefined] {
  if (typeof first === 'string') {
    return [{ ...(second as Record<string, unknown>), [key]: first } as Input<K>, third];
  }

  return [first, second as RequestOptions | undefined];
}

/**
 * Typed client for the Umami API. Every method corresponds to an OpenAPI `operationId`.
 *
 * ```ts
 * const umami = new UmamiClient({ baseUrl: 'https://api.umami.is/v1', apiKey: process.env.UMAMI_API_KEY });
 * const stats = await umami.getWebsiteStats({ websiteId, startAt, endAt });
 * ```
 *
 * Methods accept a single object that merges path parameters, query parameters and the request
 * body. Non-2xx responses throw {@link UmamiApiError}.
 */
export class UmamiClient extends GeneratedUmamiClient {
  readonly baseUrl: string;
  readonly headers: Record<string, string>;
  readonly timeout?: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: UmamiClientOptions = {}) {
    super();
    this.baseUrl = trimSlashes(options.baseUrl || DEFAULT_BASE_URL);
    this.headers = { ...buildAuthHeaders(options), ...options.headers };
    this.timeout = options.timeout;
    this.fetchImpl = resolveFetch(options.fetch);
  }

  /** Returns a copy of this client using a different bearer token. */
  withToken(token: string) {
    const { authorization: _auth, [API_KEY_HEADER]: _key, ...headers } = this.headers;

    return new UmamiClient({
      baseUrl: this.baseUrl,
      token,
      headers,
      fetch: this.fetchImpl,
      timeout: this.timeout,
    });
  }

  /** Low-level escape hatch: call any operation by ID. */
  call<K extends OperationId>(
    operationId: K,
    input?: Input<K>,
    options?: RequestOptions,
  ): Output<K> {
    return this.execute(operationId, input, options);
  }

  protected async execute<K extends OperationId>(
    operationId: K,
    input: Record<string, unknown> | undefined,
    options?: RequestOptions,
  ): Output<K> {
    const operation = operations[operationId];
    const { path, query, body } = splitInput(operation, input);
    const url = buildUrl(this.baseUrl, buildPath(operation.path, path), query);

    return sendRequest(this.fetchImpl, {
      method: operation.method,
      url,
      headers: { ...this.headers, ...options?.headers },
      body,
      signal: options?.signal,
      timeout: this.timeout,
    });
  }

  // ---------------------------------------------------------------------------
  // Compatibility overloads for the previous hand-written @umami/api-client.
  // The object form is canonical; positional forms are kept so that
  // `client.getWebsiteStats(websiteId, params)` keeps working.
  // ---------------------------------------------------------------------------

  /** @deprecated Use `listWebsites`. */
  getWebsites(input?: Input<'listWebsites'>, options?: RequestOptions) {
    return this.listWebsites(input, options);
  }

  override getWebsite(input: Input<'getWebsite'>, options?: RequestOptions): Output<'getWebsite'>;
  override getWebsite(websiteId: string, options?: RequestOptions): Output<'getWebsite'>;
  override getWebsite(first: string | Input<'getWebsite'>, second?: RequestOptions) {
    const [input, options] = positional<'getWebsite'>('websiteId', first, undefined, second);
    return super.getWebsite(input, options);
  }

  override updateWebsite(
    input: Input<'updateWebsite'>,
    options?: RequestOptions,
  ): Output<'updateWebsite'>;
  override updateWebsite(
    websiteId: string,
    data: Params<'updateWebsite', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'updateWebsite'>;
  override updateWebsite(
    first: string | Input<'updateWebsite'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'updateWebsite'>('websiteId', first, second, third);
    return super.updateWebsite(input, options);
  }

  override deleteWebsite(
    input: Input<'deleteWebsite'>,
    options?: RequestOptions,
  ): Output<'deleteWebsite'>;
  override deleteWebsite(websiteId: string, options?: RequestOptions): Output<'deleteWebsite'>;
  override deleteWebsite(first: string | Input<'deleteWebsite'>, second?: RequestOptions) {
    const [input, options] = positional<'deleteWebsite'>('websiteId', first, undefined, second);
    return super.deleteWebsite(input, options);
  }

  override getWebsiteActive(
    input: Input<'getWebsiteActive'>,
    options?: RequestOptions,
  ): Output<'getWebsiteActive'>;
  override getWebsiteActive(
    websiteId: string,
    options?: RequestOptions,
  ): Output<'getWebsiteActive'>;
  override getWebsiteActive(first: string | Input<'getWebsiteActive'>, second?: RequestOptions) {
    const [input, options] = positional<'getWebsiteActive'>('websiteId', first, undefined, second);
    return super.getWebsiteActive(input, options);
  }

  override getWebsiteDateRange(
    input: Input<'getWebsiteDateRange'>,
    options?: RequestOptions,
  ): Output<'getWebsiteDateRange'>;
  override getWebsiteDateRange(
    websiteId: string,
    options?: RequestOptions,
  ): Output<'getWebsiteDateRange'>;
  override getWebsiteDateRange(
    first: string | Input<'getWebsiteDateRange'>,
    second?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteDateRange'>(
      'websiteId',
      first,
      undefined,
      second,
    );
    return super.getWebsiteDateRange(input, options);
  }

  override getWebsiteStats(
    input: Input<'getWebsiteStats'>,
    options?: RequestOptions,
  ): Output<'getWebsiteStats'>;
  override getWebsiteStats(
    websiteId: string,
    params: Params<'getWebsiteStats', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteStats'>;
  override getWebsiteStats(
    first: string | Input<'getWebsiteStats'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteStats'>('websiteId', first, second, third);
    return super.getWebsiteStats(input, options);
  }

  override getWebsitePageviews(
    input: Input<'getWebsitePageviews'>,
    options?: RequestOptions,
  ): Output<'getWebsitePageviews'>;
  override getWebsitePageviews(
    websiteId: string,
    params: Params<'getWebsitePageviews', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsitePageviews'>;
  override getWebsitePageviews(
    first: string | Input<'getWebsitePageviews'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsitePageviews'>('websiteId', first, second, third);
    return super.getWebsitePageviews(input, options);
  }

  override getWebsiteMetrics(
    input: Input<'getWebsiteMetrics'>,
    options?: RequestOptions,
  ): Output<'getWebsiteMetrics'>;
  override getWebsiteMetrics(
    websiteId: string,
    params: Params<'getWebsiteMetrics', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteMetrics'>;
  override getWebsiteMetrics(
    first: string | Input<'getWebsiteMetrics'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteMetrics'>('websiteId', first, second, third);
    return super.getWebsiteMetrics(input, options);
  }

  override getWebsiteExpandedMetrics(
    input: Input<'getWebsiteExpandedMetrics'>,
    options?: RequestOptions,
  ): Output<'getWebsiteExpandedMetrics'>;
  override getWebsiteExpandedMetrics(
    websiteId: string,
    params: Params<'getWebsiteExpandedMetrics', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteExpandedMetrics'>;
  override getWebsiteExpandedMetrics(
    first: string | Input<'getWebsiteExpandedMetrics'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteExpandedMetrics'>(
      'websiteId',
      first,
      second,
      third,
    );
    return super.getWebsiteExpandedMetrics(input, options);
  }

  override getWebsiteEvents(
    input: Input<'getWebsiteEvents'>,
    options?: RequestOptions,
  ): Output<'getWebsiteEvents'>;
  override getWebsiteEvents(
    websiteId: string,
    params: Params<'getWebsiteEvents', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteEvents'>;
  override getWebsiteEvents(
    first: string | Input<'getWebsiteEvents'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteEvents'>('websiteId', first, second, third);
    return super.getWebsiteEvents(input, options);
  }

  override getWebsiteEventSeries(
    input: Input<'getWebsiteEventSeries'>,
    options?: RequestOptions,
  ): Output<'getWebsiteEventSeries'>;
  override getWebsiteEventSeries(
    websiteId: string,
    params: Params<'getWebsiteEventSeries', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteEventSeries'>;
  override getWebsiteEventSeries(
    first: string | Input<'getWebsiteEventSeries'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteEventSeries'>('websiteId', first, second, third);
    return super.getWebsiteEventSeries(input, options);
  }

  override getWebsiteEventStats(
    input: Input<'getWebsiteEventStats'>,
    options?: RequestOptions,
  ): Output<'getWebsiteEventStats'>;
  override getWebsiteEventStats(
    websiteId: string,
    params: Params<'getWebsiteEventStats', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteEventStats'>;
  override getWebsiteEventStats(
    first: string | Input<'getWebsiteEventStats'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteEventStats'>('websiteId', first, second, third);
    return super.getWebsiteEventStats(input, options);
  }

  override getEventData(
    input: Input<'getEventData'>,
    options?: RequestOptions,
  ): Output<'getEventData'>;
  override getEventData(
    websiteId: string,
    params: Params<'getEventData', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getEventData'>;
  override getEventData(
    first: string | Input<'getEventData'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getEventData'>('websiteId', first, second, third);
    return super.getEventData(input, options);
  }

  override getEventDataStats(
    input: Input<'getEventDataStats'>,
    options?: RequestOptions,
  ): Output<'getEventDataStats'>;
  override getEventDataStats(
    websiteId: string,
    params: Params<'getEventDataStats', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getEventDataStats'>;
  override getEventDataStats(
    first: string | Input<'getEventDataStats'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getEventDataStats'>('websiteId', first, second, third);
    return super.getEventDataStats(input, options);
  }

  override getEventDataProperties(
    input: Input<'getEventDataProperties'>,
    options?: RequestOptions,
  ): Output<'getEventDataProperties'>;
  override getEventDataProperties(
    websiteId: string,
    params: Params<'getEventDataProperties', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getEventDataProperties'>;
  override getEventDataProperties(
    first: string | Input<'getEventDataProperties'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getEventDataProperties'>(
      'websiteId',
      first,
      second,
      third,
    );
    return super.getEventDataProperties(input, options);
  }

  override getEventDataValues(
    input: Input<'getEventDataValues'>,
    options?: RequestOptions,
  ): Output<'getEventDataValues'>;
  override getEventDataValues(
    websiteId: string,
    params: Params<'getEventDataValues', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getEventDataValues'>;
  override getEventDataValues(
    first: string | Input<'getEventDataValues'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getEventDataValues'>('websiteId', first, second, third);
    return super.getEventDataValues(input, options);
  }

  override getWebsiteSessions(
    input: Input<'getWebsiteSessions'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessions'>;
  override getWebsiteSessions(
    websiteId: string,
    params: Params<'getWebsiteSessions', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessions'>;
  override getWebsiteSessions(
    first: string | Input<'getWebsiteSessions'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteSessions'>('websiteId', first, second, third);
    return super.getWebsiteSessions(input, options);
  }

  override getWebsiteSessionStats(
    input: Input<'getWebsiteSessionStats'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessionStats'>;
  override getWebsiteSessionStats(
    websiteId: string,
    params: Params<'getWebsiteSessionStats', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessionStats'>;
  override getWebsiteSessionStats(
    first: string | Input<'getWebsiteSessionStats'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteSessionStats'>(
      'websiteId',
      first,
      second,
      third,
    );
    return super.getWebsiteSessionStats(input, options);
  }

  override getWebsiteSession(
    input: Input<'getWebsiteSession'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSession'>;
  override getWebsiteSession(
    websiteId: string,
    sessionId: string,
    options?: RequestOptions,
  ): Output<'getWebsiteSession'>;
  override getWebsiteSession(
    first: string | Input<'getWebsiteSession'>,
    second?: string | RequestOptions,
    third?: RequestOptions,
  ) {
    if (typeof first === 'string') {
      return super.getWebsiteSession({ websiteId: first, sessionId: second as string }, third);
    }

    return super.getWebsiteSession(first, second as RequestOptions | undefined);
  }

  override getWebsiteSessionActivity(
    input: Input<'getWebsiteSessionActivity'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessionActivity'>;
  override getWebsiteSessionActivity(
    websiteId: string,
    sessionId: string,
    params: Params<'getWebsiteSessionActivity', 'websiteId' | 'sessionId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessionActivity'>;
  override getWebsiteSessionActivity(
    first: string | Input<'getWebsiteSessionActivity'>,
    second?: string | RequestOptions,
    third?: Record<string, unknown> | RequestOptions,
    fourth?: RequestOptions,
  ) {
    if (typeof first === 'string') {
      return super.getWebsiteSessionActivity(
        {
          ...(third as Record<string, unknown>),
          websiteId: first,
          sessionId: second as string,
        } as Input<'getWebsiteSessionActivity'>,
        fourth,
      );
    }

    return super.getWebsiteSessionActivity(first, second as RequestOptions | undefined);
  }

  override getWebsiteSessionProperties(
    input: Input<'getWebsiteSessionProperties'>,
    options?: RequestOptions,
  ): Output<'getWebsiteSessionProperties'>;
  override getWebsiteSessionProperties(
    websiteId: string,
    sessionId: string,
    options?: RequestOptions,
  ): Output<'getWebsiteSessionProperties'>;
  override getWebsiteSessionProperties(
    first: string | Input<'getWebsiteSessionProperties'>,
    second?: string | RequestOptions,
    third?: RequestOptions,
  ) {
    if (typeof first === 'string') {
      return super.getWebsiteSessionProperties(
        { websiteId: first, sessionId: second as string },
        third,
      );
    }

    return super.getWebsiteSessionProperties(first, second as RequestOptions | undefined);
  }

  override getWebsiteReports(
    input: Input<'getWebsiteReports'>,
    options?: RequestOptions,
  ): Output<'getWebsiteReports'>;
  override getWebsiteReports(
    websiteId: string,
    params?: Params<'getWebsiteReports', 'websiteId'>,
    options?: RequestOptions,
  ): Output<'getWebsiteReports'>;
  override getWebsiteReports(
    first: string | Input<'getWebsiteReports'>,
    second?: Record<string, unknown> | RequestOptions,
    third?: RequestOptions,
  ) {
    const [input, options] = positional<'getWebsiteReports'>('websiteId', first, second, third);
    return super.getWebsiteReports(input, options);
  }
}
