import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { UmamiClient, type UmamiClientOptions } from '@umami/api-client';
import { type McpLogger, stderrLogger } from './lib/logger';
import { createUmamiMcpServer } from './server';

export interface StdioEnvironment {
  UMAMI_URL?: string;
  UMAMI_API_URL?: string;
  UMAMI_API_TOKEN?: string;
  UMAMI_API_KEY?: string;
  [key: string]: string | undefined;
}

function trimSlashes(value: string) {
  return value.replace(/\/+$/, '');
}

/**
 * Resolves client options from environment variables:
 *
 * - `UMAMI_API_URL` — full API base URL (e.g. `https://api.umami.is/v1`, `https://example.com/api`).
 * - `UMAMI_URL` — self-hosted instance URL; `/api` is appended automatically.
 * - `UMAMI_API_TOKEN` — bearer token (login token or self-hosted API key).
 * - `UMAMI_API_KEY` — Umami Cloud API key.
 */
export function resolveClientOptions(env: StdioEnvironment = process.env): UmamiClientOptions {
  const apiUrl = env.UMAMI_API_URL?.trim();
  const instanceUrl = env.UMAMI_URL?.trim();
  const token = env.UMAMI_API_TOKEN?.trim();
  const apiKey = env.UMAMI_API_KEY?.trim();

  if (!token && !apiKey) {
    throw new Error(
      'Missing credentials. Set UMAMI_API_TOKEN (self-hosted API key or login token) or UMAMI_API_KEY (Umami Cloud).',
    );
  }

  let baseUrl: string | undefined;

  if (apiUrl) {
    baseUrl = trimSlashes(apiUrl);
  } else if (instanceUrl) {
    const trimmed = trimSlashes(instanceUrl);
    baseUrl = /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
  }

  return { baseUrl, token, apiKey };
}

export interface ServeStdioOptions {
  env?: StdioEnvironment;
  logger?: McpLogger;
}

/** Serves the Umami MCP server over stdio for local agents (Claude Desktop, Cursor, …). */
export function serveUmamiStdio(options: ServeStdioOptions = {}) {
  const client = new UmamiClient(resolveClientOptions(options.env));
  const logger = options.logger ?? stderrLogger;

  return serveStdio(() => createUmamiMcpServer({ client, logger }));
}
