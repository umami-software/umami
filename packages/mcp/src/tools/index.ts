import type { AnyToolDefinition } from '../lib/tool';
import { getEvents } from './events';
import { getWebsiteMetrics } from './metrics';
import { getRealtime } from './realtime';
import { getRevenue, runAttribution, runFunnel, runJourney, runRetention } from './reports';
import { getSession } from './session';
import { getSessions } from './sessions';
import { getWebsiteStats } from './stats';
import { getWebsiteTraffic } from './traffic';
import { listWebsites } from './websites';

/** Core read-only analytics tools. */
export const coreTools: AnyToolDefinition[] = [
  listWebsites,
  getWebsiteStats,
  getWebsiteTraffic,
  getWebsiteMetrics,
  getRealtime,
  getEvents,
  getSessions,
  getSession,
];

/** Higher-level report tools. */
export const reportTools: AnyToolDefinition[] = [
  runFunnel,
  runJourney,
  runRetention,
  runAttribution,
  getRevenue,
];

export const allTools: AnyToolDefinition[] = [...coreTools, ...reportTools];

export {
  getEvents,
  getRealtime,
  getRevenue,
  getSession,
  getSessions,
  getWebsiteMetrics,
  getWebsiteStats,
  getWebsiteTraffic,
  listWebsites,
  runAttribution,
  runFunnel,
  runJourney,
  runRetention,
};
