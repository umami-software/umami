import { NextApiRequest } from 'next';
import { EVENT_DATA_TYPE, EVENT_TYPE, KAFKA_TOPIC, ROLES } from './constants';

type ObjectValues<T> = T[keyof T];

export type Roles = ObjectValues<typeof ROLES>;

export type EventTypes = ObjectValues<typeof EVENT_TYPE>;

export type EventDataTypes = ObjectValues<typeof EVENT_DATA_TYPE>;

export type KafkaTopics = ObjectValues<typeof KAFKA_TOPIC>;

export interface EventData {
  [key: string]: number | string | EventData | number[] | string[] | EventData[];
}

export interface Auth {
  user?: {
    id: string;
    username: string;
    role: string;
    isAdmin: boolean;
  };
  shareToken?: {
    websiteId: string;
  };
}

export interface NextApiRequestQueryBody<TQuery = any, TBody = any> extends NextApiRequest {
  auth?: Auth;
  query: TQuery & { [key: string]: string | string[] };
  body: TBody;
  headers: any;
}

export interface NextApiRequestAuth extends NextApiRequest {
  auth?: Auth;
  headers: any;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: string;
  createdAt?: Date;
}

export interface Website {
  id: string;
  userId: string;
  resetAt: Date;
  name: string;
  domain: string;
  shareId: string;
  createdAt: Date;
}

export interface Share {
  id: string;
  token: string;
}

export interface WebsiteActive {
  x: number;
}

export interface WebsiteMetric {
  x: string;
  y: number;
}

export interface WebsiteMetricFilter {
  domain?: string;
  url?: string;
  referrer?: string;
  title?: string;
  query?: string;
  event?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region?: string;
  city?: string;
}

export interface WebsiteEventMetric {
  x: string;
  t: string;
  y: number;
}

export interface WebsiteEventDataMetric {
  x: string;
  t: string;
  eventName?: string;
  urlPath?: string;
}

export interface WebsitePageviews {
  pageviews: {
    t: string;
    y: number;
  };
  sessions: {
    t: string;
    y: number;
  };
}

export interface WebsiteStats {
  pageviews: { value: number; change: number };
  uniques: { value: number; change: number };
  bounces: { value: number; change: number };
  totalTime: { value: number; change: number };
}

export interface RealtimeInit {
  websites: Website[];
  token: string;
  data: RealtimeUpdate;
}

export interface RealtimeUpdate {
  pageviews: any[];
  sessions: any[];
  events: any[];
  timestamp: number;
}
