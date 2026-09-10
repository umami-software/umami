import type { AnyToolDefinition } from '../lib/tool';
import { getWebsiteDateRange } from './daterange';
import { getEventProperties } from './event-properties';
import { getEventSeries, getEventStats } from './event-stats';
import { getEvents } from './events';
import { getWebsiteMetrics } from './metrics';
import { getRealtime } from './realtime';
import { getRevenue, runAttribution, runFunnel, runJourney, runRetention } from './reports';
import { getSession } from './session';
import { getSessionStats } from './session-stats';
import { getSessions } from './sessions';
import { getWebsiteStats } from './stats';
import { getWebsiteTraffic } from './traffic';
import { listWebsites } from './websites';

/** Core read-only analytics tools. */
export const coreTools: AnyToolDefinition[] = [
  listWebsites,
  getWebsiteDateRange,
  getWebsiteStats,
  getWebsiteTraffic,
  getWebsiteMetrics,
  getRealtime,
  getEvents,
  getEventStats,
  getEventSeries,
  getEventProperties,
  getSessions,
  getSessionStats,
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
  getEventProperties,
  getEventSeries,
  getEventStats,
  getEvents,
  getRealtime,
  getRevenue,
  getSession,
  getSessionStats,
  getSessions,
  getWebsiteDateRange,
  getWebsiteMetrics,
  getWebsiteStats,
  getWebsiteTraffic,
  listWebsites,
  runAttribution,
  runFunnel,
  runJourney,
  runRetention,
};
