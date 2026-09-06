import { McpServer } from '@modelcontextprotocol/server';
import type { UmamiClient } from '@umami/api-client';
import { type McpLogger, silentLogger } from './lib/logger';
import { type AnyToolDefinition, registerTool, type ToolContext } from './lib/tool';
import { allTools } from './tools';

export const SERVER_NAME = 'umami';
export const SERVER_VERSION = '1.0.0';

export const SERVER_INSTRUCTIONS = `Umami is a privacy-focused web analytics platform. These tools answer questions about website traffic, visitors, pages, referrers, events, sessions and conversion reports.

Workflow:
1. Call list_websites to find the websiteId for the site the user is asking about (match by name or domain).
2. Use get_website_stats for totals, get_website_traffic for trends over time, get_website_metrics for rankings (top pages, referrers, countries, browsers, campaigns, events), get_realtime for current visitors, get_events / get_sessions / get_session to inspect individual activity, and run_funnel / run_journey / run_retention / run_attribution / get_revenue for reports.

Dates are ISO 8601 strings; endAt defaults to now. Results are paginated where noted — request another page rather than a huge pageSize. All tools are read-only.`;

export interface CreateUmamiMcpServerOptions {
  /** API client carrying the caller's credentials. The MCP server never touches storage directly. */
  client: UmamiClient;
  /** Structured logger. Defaults to silent; the stdio CLI logs to stderr. */
  logger?: McpLogger;
  /** Identity for log correlation (never used for authorization). */
  identity?: ToolContext['identity'];
  /** Override the registered tool set (defaults to all read-only tools). */
  tools?: AnyToolDefinition[];
}

/**
 * Creates an MCP server whose tools call the Umami API through `@umami/api-client`.
 * The same factory backs both the stdio CLI and the embedded HTTP endpoint.
 */
export function createUmamiMcpServer(options: CreateUmamiMcpServerOptions) {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: SERVER_INSTRUCTIONS },
  );
  const context: ToolContext = {
    client: options.client,
    logger: options.logger ?? silentLogger,
    identity: options.identity,
  };

  for (const tool of options.tools ?? allTools) {
    registerTool(server, tool, context);
  }

  return server;
}
