import type { AnyToolDefinition } from '../lib/tool';
import { getAnnotations } from './annotations';
import { getWebsiteDateRange } from './daterange';
import { getEventProperties } from './event-properties';
import { getEventSeries, getEventStats } from './event-stats';
import { getEvents } from './events';
import { listFunnels } from './funnels';
import { getGoals } from './goals';
import { getWebsiteMetrics } from './metrics';
import { getPerformance } from './performance';
import { getRealtime } from './realtime';
import { getRevenue, runAttribution, runFunnel, runJourney, runRetention } from './reports';
import { listSegments } from './segments';
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
  getAnnotations,
  listSegments,
];

/** Higher-level report tools. */
export const reportTools: AnyToolDefinition[] = [
  listFunnels,
  runFunnel,
  getGoals,
  runJourney,
  runRetention,
  runAttribution,
  getRevenue,
  getPerformance,
];

export const allTools: AnyToolDefinition[] = [...coreTools, ...reportTools];

export {
  getAnnotations,
  getEventProperties,
  getEventSeries,
  getEventStats,
  getEvents,
  getGoals,
  getPerformance,
  getRealtime,
  getRevenue,
  getSession,
  getSessionStats,
  getSessions,
  getWebsiteDateRange,
  getWebsiteMetrics,
  getWebsiteStats,
  getWebsiteTraffic,
  listFunnels,
  listSegments,
  listWebsites,
  runAttribution,
  runFunnel,
  runJourney,
  runRetention,
};
