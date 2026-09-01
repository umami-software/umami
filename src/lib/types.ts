import type { UseQueryOptions } from '@tanstack/react-query';
import type { Board as PrismaBoard } from '@/generated/prisma/client';
import type { DATA_TYPE, OPERATORS, ROLES } from './constants';
import type { TIME_UNIT } from './date';

export type ObjectValues<T> = T[keyof T];

export type ReactQueryOptions<T = any> = Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>;

export type TimeUnit = ObjectValues<typeof TIME_UNIT>;
export type Role = ObjectValues<typeof ROLES>;
export type DynamicDataType = ObjectValues<typeof DATA_TYPE>;
export type Operator = (typeof OPERATORS)[keyof typeof OPERATORS];

export interface Auth {
  user?: {
    id: string;
    username: string;
    role: string;
    isAdmin: boolean;
  };
  shareToken?: {
    shareType?: number;
    websiteId?: string;
    websiteIds?: string[];
    boardId?: string;
    pixelId?: string;
    pixelIds?: string[];
    linkId?: string;
    linkIds?: string[];
    parameters?: ShareParameters;
  };
}

export type ShareTheme = 'light' | 'dark';

export interface ShareParameters {
  allowFilter?: boolean;
  theme?: ShareTheme;
  [key: string]: boolean | ShareTheme | undefined;
}

export interface PropertyFilter {
  propertyName: string;
  dataType: number;
  operator: Operator;
  value: string;
}

export type EventPropertyFilter = PropertyFilter;
export type SessionPropertyFilter = PropertyFilter;

export interface Filter {
  name: string;
  operator: Operator;
  value: string | string[];
  type?: string;
  column?: string;
  prefix?: string;
  paramName?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  value?: string;
  unit?: TimeUnit;
  num?: number;
  offset?: number;
}

export interface DynamicData {
  [key: string]: number | string | number[] | string[];
}

export interface EventDataSeriesPoint {
  x: string;
  t: string;
  y: number;
}

export interface EventDataDateSeriesPoint {
  t: string;
  y: number;
}

export interface EventDataNumericStats {
  total: number;
  average: number;
  median: number;
  max: number;
  min: number;
}

export interface SessionDataPivotRow {
  sessionId: string;
  distinctId: string;
  createdAt: string | Date;
  propertyKeys: string[];
  propertyValues: string[];
}

export interface PropertyLeaderboardRow {
  label: string;
  activity: number;
  sessions: number;
  visits: number;
  views: number;
  events: number;
}

export interface QueryOptions {
  joinSession?: boolean;
  columns?: Record<string, string>;
  limit?: number;
  prefix?: string;
  isCohort?: boolean;
  cohortMatch?: string;
  cohortActionName?: string;
}

export interface QueryFilters
  extends DateParams,
    FilterParams,
    SortParams,
    PageParams,
    SegmentParams {
  minDuration?: number;
  cohortFilters?: QueryFilters;
  eventPropertyFilters?: EventPropertyFilter[];
  sessionPropertyFilters?: SessionPropertyFilter[];
}

export interface DateParams {
  startDate?: Date;
  endDate?: Date;
  unit?: string;
  timezone?: string;
  compareDate?: Date;
}

export interface FilterParams {
  path?: string;
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
  eventType?: number;
  segment?: string;
  cohort?: string;
  compare?: string;
  excludeBounce?: boolean;
  match?: 'all' | 'any';
}

export interface SortParams {
  orderBy?: string;
  sortDescending?: boolean;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  maxResults?: number;
}

export interface SegmentParams {
  segment?: string;
  cohort?: string;
}

export interface PageResult<T> {
  data: T;
  count: number;
  page: number;
  pageSize: number;
  orderBy?: string;
  sortDescending?: boolean;
  search?: string;
  isCapped?: boolean;
}

export interface ActiveVisitors {
  visitors: number;
}

export interface WebsiteDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface PropertyMetric {
  propertyName: string;
  dataType: number;
  total: number;
}

export interface PropertyValue {
  value: string;
  total: number;
}

export interface TimeSeriesValue {
  t: string;
  y: number;
}

export interface WebsiteSession {
  id: string;
  websiteId: string;
  hostname: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  country: string;
  region: string;
  city: string;
  firstAt: Date | string;
  lastAt: Date | string;
  visits: number;
  views: number;
  events: number;
  createdAt: Date | string;
}

export interface WebsiteEvent {
  id: string;
  websiteId: string;
  sessionId: string;
  createdAt: Date | string;
  hostname: string;
  urlPath: string;
  urlQuery: string;
  referrerPath: string;
  referrerQuery: string;
  referrerDomain: string;
  country: string;
  city: string;
  device: string;
  os: string;
  browser: string;
  pageTitle: string;
  eventType: number;
  eventName: string;
  hasData: boolean;
}

export interface EventDataPivotRow {
  eventId: string;
  sessionId: string;
  eventName: string;
  urlPath: string;
  createdAt: Date | string;
  propertyKeys: string[];
  propertyValues: string[];
}

export interface SessionReplaySummary {
  id: string;
  sessionId: string;
  websiteId: string;
  browser: string;
  os: string;
  device: string;
  country: string;
  city: string;
  eventCount: number;
  chunkCount: number;
  startedAt: Date | string;
  endedAt: Date | string;
  duration: number;
  createdAt: Date | string;
}

export interface SessionActivity {
  createdAt: Date | string;
  urlPath: string;
  urlQuery: string;
  referrerDomain: string;
  eventId: string;
  eventType: number;
  eventName: string;
  visitId: string;
  hostname: string;
  hasData: boolean;
}

export interface SessionDataValue {
  websiteId: string;
  sessionId: string;
  dataKey: string;
  dataType: number;
  stringValue: string | null;
  numberValue: number | null;
  dateValue: Date | string | null;
  createdAt: Date | string;
}

export interface RealtimeData {
  countries: Record<string, number>;
  events: RealtimeEvent[];
  referrers: Record<string, number>;
  timestamp: number;
  series: {
    views: EventDataSeriesPoint[];
    visitors: EventDataSeriesPoint[];
  };
  totals: {
    views: number;
    visitors: number;
    events: number;
    countries: number;
  };
  urls: Record<string, number>;
}

export interface RealtimeActivity {
  sessionId: string;
  eventName: string;
  createdAt: Date | string;
  browser: string;
  os: string;
  device: string;
  country: string;
  urlPath: string;
  referrerDomain: string;
  hostname: string;
}

export interface RealtimeEvent extends RealtimeActivity {
  __type: 'session' | 'event' | 'pageview';
}

export interface ApiError extends Error {
  code?: string;
  message: string;
}

export interface BoardComponentConfig {
  type: string;
  entityType?: 'website' | 'pixel' | 'link';
  entityId?: string;
  websiteId?: string;
  title?: string;
  description?: string;
  props?: Record<string, any>;
}

export interface BoardColumn {
  id: string;
  component?: BoardComponentConfig;
  size?: number;
}

export interface BoardRow {
  id: string;
  columns: BoardColumn[];
  size?: number;
}

export interface BoardParameters {
  websiteId?: string;
  pixelId?: string;
  linkId?: string;
  rows?: BoardRow[];
}

export interface Board extends Omit<PrismaBoard, 'parameters'> {
  parameters: BoardParameters;
}

export interface WhiteLabel {
  displayName: string;
  domainName: string;
  logoUrl: string;
}
