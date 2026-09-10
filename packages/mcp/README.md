# @umami/mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for [Umami](https://umami.is)
analytics. Lets Claude, ChatGPT, Cursor and other MCP clients answer questions about your
website traffic using read-only tools that call the Umami API through `@umami/api-client`.

The MCP server never talks to a database; every tool goes through the public API and the same
user/team permission checks as the web app.

## Tools

| Tool                  | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `list_websites`       | Find the websites you can access (call first to get a `websiteId`).     |
| `get_website_stats`   | Pageviews, visitors, visits, bounce rate, duration + previous period.   |
| `get_website_traffic` | Pageview/visit time series by minute, hour, day, month or year.         |
| `get_website_metrics` | Top pages, referrers, channels, countries, browsers, devices, UTM, events. |
| `get_realtime`        | Visitors active right now.                                              |
| `get_events`          | Individual tracked events (paginated).                                  |
| `get_sessions`        | Visitor sessions (paginated).                                           |
| `get_session`         | One session with its activity timeline and properties.                  |
| `run_funnel`          | Conversion funnel across page/event steps.                              |
| `run_journey`         | Most common paths visitors take.                                        |
| `run_retention`       | Cohort retention table.                                                 |
| `run_attribution`     | First/last-click attribution for a conversion.                          |
| `get_revenue`         | Revenue totals, series and breakdowns.                                  |

All tools are read-only. Dates are ISO 8601; results are paginated with a hard cap on page size.

## Remote: Umami Cloud

Connect to `https://cloud.umami.is/mcp` using your existing Cloud API key:

```text
Authorization: Bearer api_<your-cloud-api-key>
```

Clients that support custom headers may use `x-umami-api-key` instead. If both headers are
provided, they must contain the same key. Use a client that supports API-key or bearer-header
configuration.

Cloud MCP has the same subscription requirements and website/team permissions as the Cloud API.
All tools call the Cloud API gateway, which validates the key and routes requests to your region.

## Remote: self-hosted

Generate an API key under **Settings → API keys** in your Umami instance, then configure your
MCP client with the Streamable HTTP endpoint:

```text
https://your-umami.example.com/mcp
```

Set the authorization header using your key:

```text
Authorization: Bearer umami_<your-api-key>
```

Use a client that supports bearer tokens or custom authorization headers. The endpoint accepts
self-hosted API keys; browser login tokens are not supported. Tools are read-only and respect
the key owner's existing user/team permissions. Revoke the key in Settings to disconnect access.
MCP is disabled by default. Set `MCP_ENABLED=1` to enable the endpoint.

## Local / stdio

```json
{
  "mcpServers": {
    "umami": {
      "command": "npx",
      "args": ["-y", "@umami/mcp"],
      "env": {
        "UMAMI_URL": "https://analytics.example.com",
        "UMAMI_API_TOKEN": "umami_…"
      }
    }
  }
}
```

| Variable          | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `UMAMI_URL`       | Self-hosted instance URL (`/api` is appended).                     |
| `UMAMI_API_URL`   | Full API base URL instead, e.g. `https://api.umami.is/v1`.         |
| `UMAMI_API_TOKEN` | API key or login token (self-hosted).                              |
| `UMAMI_API_KEY`   | Umami Cloud API key.                                               |

For Cloud stdio, set `UMAMI_API_KEY` and omit `UMAMI_URL` and `UMAMI_API_TOKEN`:

```json
{
  "mcpServers": {
    "umami": {
      "command": "npx",
      "args": ["-y", "@umami/mcp"],
      "env": { "UMAMI_API_KEY": "api_<your-cloud-api-key>" }
    }
  }
}
```

## Example prompts

- Show my websites.
- How many visitors did example.com get last week?
- What were the top 10 pages this month?
- Compare traffic this month with the previous month.
- Where is traffic coming from?
- What signup events occurred yesterday?
- Show sessions for user abc123.

## Programmatic use

```ts
import { UmamiClient } from '@umami/api-client';
import { createUmamiMcpServer } from '@umami/mcp';

const server = createUmamiMcpServer({
  client: new UmamiClient({ baseUrl, token }),
});
```

`createUmamiMcpHttpHandler({ createClient })` returns a Streamable HTTP handler for embedding in
any web framework; the host verifies the bearer token and passes `authInfo`.
