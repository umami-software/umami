import type { CallToolResult, McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import type { UmamiClient } from '@umami/api-client';
import type { z } from 'zod';
import { describeError } from './errors';
import type { McpLogger } from './logger';

export interface ToolContext {
  client: UmamiClient;
  logger: McpLogger;
  /** Identity attached to the connection (HTTP/OAuth mode). Used for logs only. */
  identity?: { userId?: string; clientId?: string; requestId?: string };
}

export interface ToolDefinition<Schema extends z.ZodObject<z.ZodRawShape>> {
  name: string;
  title: string;
  description: string;
  inputSchema: Schema;
  annotations?: ToolAnnotations;
  handler: (input: z.infer<Schema>, context: ToolContext) => Promise<Record<string, unknown>>;
}

export function defineTool<Schema extends z.ZodObject<z.ZodRawShape>>(
  definition: ToolDefinition<Schema>,
): ToolDefinition<Schema> {
  return definition;
}

export type AnyToolDefinition = ToolDefinition<z.ZodObject<z.ZodRawShape>>;

const READ_ONLY: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export function successResult(data: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

export function errorResult(error: ReturnType<typeof describeError>): CallToolResult {
  return {
    content: [{ type: 'text', text: `Error (${error.code}): ${error.message}` }],
    structuredContent: { error },
    isError: true,
  };
}

function getWebsiteId(input: unknown) {
  const value = (input as { websiteId?: unknown })?.websiteId;

  return typeof value === 'string' ? value : undefined;
}

function getSessionId(input: unknown) {
  const value = (input as { sessionId?: unknown })?.sessionId;

  return typeof value === 'string' ? value : undefined;
}

export function registerTool(
  server: McpServer,
  definition: AnyToolDefinition,
  context: ToolContext,
) {
  server.registerTool(
    definition.name,
    {
      title: definition.title,
      description: definition.description,
      inputSchema: definition.inputSchema,
      annotations: { ...READ_ONLY, ...definition.annotations },
    },
    async (args: Record<string, unknown>) => {
      const startedAt = Date.now();
      const websiteId = getWebsiteId(args);
      const base = {
        event: 'tool_call' as const,
        tool: definition.name,
        websiteId,
        ...context.identity,
      };

      try {
        const data = await definition.handler(args, context);

        context.logger.info({ ...base, ok: true, durationMs: Date.now() - startedAt });

        return successResult(data);
      } catch (error) {
        const described = describeError(error, { websiteId, sessionId: getSessionId(args) });

        context.logger.error({
          ...base,
          ok: false,
          durationMs: Date.now() - startedAt,
          errorCode: described.code,
          status: described.status,
        });

        return errorResult(described);
      }
    },
  );
}
