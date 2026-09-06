export interface McpLogEvent {
  event: 'tool_call';
  tool: string;
  ok: boolean;
  durationMs: number;
  websiteId?: string;
  errorCode?: string;
  status?: number;
  userId?: string;
  clientId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface McpLogger {
  info(event: McpLogEvent): void;
  error(event: McpLogEvent): void;
}

/** Writes JSON lines to stderr so stdio transports keep stdout clean. */
export const stderrLogger: McpLogger = {
  info(event) {
    process.stderr.write(`${JSON.stringify(event)}\n`);
  },
  error(event) {
    process.stderr.write(`${JSON.stringify(event)}\n`);
  },
};

export const silentLogger: McpLogger = {
  info() {},
  error() {},
};
