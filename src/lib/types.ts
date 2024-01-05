import { NextApiRequest } from 'next';
import {
  COLLECTION_TYPE,
  DATA_TYPE,
  EVENT_TYPE,
  KAFKA_TOPIC,
  PERMISSIONS,
  REPORT_TYPES,
  ROLES,
} from './constants';
import * as yup from 'yup';
import { TIME_UNIT } from './date';

type ObjectValues<T> = T[keyof T];

export type TimeUnit = ObjectValues<typeof TIME_UNIT>;
export type Permission = ObjectValues<typeof PERMISSIONS>;

export type CollectionType = ObjectValues<typeof COLLECTION_TYPE>;
export type Role = ObjectValues<typeof ROLES>;
export type EventType = ObjectValues<typeof EVENT_TYPE>;
export type DynamicDataType = ObjectValues<typeof DATA_TYPE>;
export type KafkaTopic = ObjectValues<typeof KAFKA_TOPIC>;
export type ReportType = ObjectValues<typeof REPORT_TYPES>;

export interface WebsiteSearchFilter extends SearchFilter {
  userId?: string;
  teamId?: string;
  includeTeams?: boolean;
  onlyTeams?: boolean;
}

export interface UserSearchFilter extends SearchFilter {
  teamId?: string;
}

export interface TeamSearchFilter extends SearchFilter {
  userId?: string;
}

export interface ReportSearchFilter extends SearchFilter {
  userId?: string;
  websiteId?: string;
  includeTeams?: boolean;
}

export interface SearchFilter {
  query?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  sortDescending?: boolean;
}

export interface FilterResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  orderBy?: string;
  sortDescending?: boolean;
}

export interface DynamicData {
  [key: string]: number | string | DynamicData | number[] | string[] | DynamicData[];
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

export interface YupRequest {
  GET?: yup.ObjectSchema<any>;
  POST?: yup.ObjectSchema<any>;
  PUT?: yup.ObjectSchema<any>;
  DELETE?: yup.ObjectSchema<any>;
}

export interface NextApiRequestQueryBody<TQuery = any, TBody = any> extends NextApiRequest {
  auth?: Auth;
  query: TQuery & { [key: string]: string | string[] };
  body: TBody;
  headers: any;
  yup: YupRequest;
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

export interface WebsiteEventMetric {
  x: string;
  t: string;
  y: number;
}

export interface WebsiteEventData {
  eventName?: string;
  fieldName: string;
  dataType: number;
  fieldValue?: string;
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

export interface DateRange {
  startDate: Date;
  endDate: Date;
  value: string;
  unit?: TimeUnit;
  selectedUnit?: { num: number; unit: TimeUnit };
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
  os?: string;
  browser?: string;
  device?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  event?: string;
}

export interface QueryOptions {
  joinSession?: boolean;
  columns?: { [key: string]: string };
  limit?: number;
}

export interface RealtimeData {
  pageviews: any[];
  sessions: any[];
  events: any[];
  timestamp: number;
  countries?: any[];
  visitors?: any[];
}
