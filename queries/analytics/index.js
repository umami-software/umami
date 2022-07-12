import { getEventMetrics } from './event/getEventMetrics';
import { getEvents } from './event/getEvents';
import { saveEvent } from './event/saveEvent';
import { getPageviewMetrics } from './pageview/getPageviewMetrics';
import { getPageviews } from './pageview/getPageviews';
import { getPageviewStats } from './pageview/getPageviewStats';
import { savePageView } from './pageview/savePageView';
import { createSession } from './session/createSession';
import { getSessionByUuid } from './session/getSessionByUuid';
import { getSessionMetrics } from './session/getSessionMetrics';
import { getSessions } from './session/getSessions';
import { getActiveVisitors } from './stats/getActiveVisitors';
import { getRealtimeData } from './stats/getRealtimeData';
import { getWebsiteStats } from './stats/getWebsiteStats';

export default {
  getEventMetrics,
  getEvents,
  saveEvent,
  getPageviewMetrics,
  getPageviews,
  getPageviewStats,
  savePageView,
  createSession,
  getSessionByUuid,
  getSessionMetrics,
  getSessions,
  getActiveVisitors,
  getRealtimeData,
  getWebsiteStats,
};
