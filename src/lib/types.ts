import {
  COLLECTION_TYPE,
  DATA_TYPE,
  EVENT_TYPE,
  KAFKA_TOPIC,
  PERMISSIONS,
  REPORT_TYPES,
  ROLES,
} from './constants';
import { TIME_UNIT } from './date';
import { Dispatch, SetStateAction } from 'react';

type ObjectValues<T> = T[keyof T];

export type TimeUnit = ObjectValues<typeof TIME_UNIT>;
export type Permission = ObjectValues<typeof PERMISSIONS>;

export type CollectionType = ObjectValues<typeof COLLECTION_TYPE>;
export type Role = ObjectValues<typeof ROLES>;
export type EventType = ObjectValues<typeof EVENT_TYPE>;
export type DynamicDataType = ObjectValues<typeof DATA_TYPE>;
export type KafkaTopic = ObjectValues<typeof KAFKA_TOPIC>;
export type ReportType = ObjectValues<typeof REPORT_TYPES>;

export interface PageParams {
  search?: string;
  page?: string | number;
  pageSize?: string;
  orderBy?: string;
  sortDescending?: boolean;
}

export interface PageResult<T> {
  data: T;
  count: number;
  page: number;
  pageSize: number;
  orderBy?: string;
  sortDescending?: boolean;
}

export interface PagedQueryResult<T> {
  result: PageResult<T>;
  query: any;
  params: PageParams;
  setParams: Dispatch<SetStateAction<T | PageParams>>;
}

export interface DynamicData {
  [key: string]: number | string | number[] | string[];
}

export interface Auth {
  user?: {
    id: string;
    username: string;
    role: string;
    isAdmin: boolean;
  };
  grant?: Permission[];
  shareToken?: {
    websiteId: string;
  };
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

export interface WebsiteEventMetric {
  x: string;
  t: string;
  y: number;
}

export interface WebsiteEventData {
  eventName?: string;
  propertyName: string;
  dataType: number;
  propertyValue?: string;
  total: number;
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
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number };
}

export interface DateRange {
  value: string;
  startDate: Date;
  endDate: Date;
  unit?: TimeUnit;
  num?: number;
  offset?: number;
}

export interface QueryFilters {
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  unit?: string;
  eventType?: number;
  url?: string;
  referrer?: string;
  title?: string;
  query?: string;
  host?: string;
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  event?: string;
  search?: string;
  tag?: string;
  pathPrefix?: string;
}

export interface QueryOptions {
  joinSession?: boolean;
  columns?: { [key: string]: string };
  limit?: number;
}

export interface RealtimeData {
  countries: { [key: string]: number };
  events: any[];
  pageviews: any[];
  referrers: { [key: string]: number };
  timestamp: number;
  series: {
    views: any[];
    visitors: any[];
  };
  totals: {
    views: number;
    visitors: number;
    events: number;
    countries: number;
  };
  urls: { [key: string]: number };
  visitors: any[];
}

export interface SessionData {
  id: string;
  websiteId: string;
  visitId: string;
  hostname: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  country: string;
  region: string;
  city: string;
  ip?: string;
  userAgent?: string;
}
