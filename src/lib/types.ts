import { Dispatch, SetStateAction } from 'react';
import { UseQueryOptions } from '@tanstack/react-query';
import { DATA_TYPE, PERMISSIONS, ROLES } from './constants';
import { TIME_UNIT } from './date';

export type ObjectValues<T> = T[keyof T];

export type ReactQueryOptions<T> = Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>;

export type TimeUnit = ObjectValues<typeof TIME_UNIT>;
export type Permission = ObjectValues<typeof PERMISSIONS>;
export type Role = ObjectValues<typeof ROLES>;
export type DynamicDataType = ObjectValues<typeof DATA_TYPE>;

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

export interface InputItem {
  id: string;
  label: string;
  icon: any;
  seperator?: boolean;
}
