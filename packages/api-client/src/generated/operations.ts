// GENERATED FILE. DO NOT EDIT.
// Source: public/openapi.json — regenerate with `pnpm generate:api`.

import type { RequestOptions } from '../types';
import type { components, operations as OperationTypes } from './types';

export const API_VERSION = '3.3.0';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface OperationDefinition {
  readonly operationId: string;
  readonly method: HttpMethod;
  readonly path: string;
  readonly pathParams: readonly string[];
  readonly queryParams: readonly string[];
  readonly hasBody: boolean;
  readonly scope?: string;
}

export const operations = {
  batch: {
    operationId: 'batch',
    method: 'post',
    path: '/api/batch',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  cancelTwoFactorSetup: {
    operationId: 'cancelTwoFactorSetup',
    method: 'post',
    path: '/api/2fa/setup/cancel',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  cloneBoard: {
    operationId: 'cloneBoard',
    method: 'post',
    path: '/api/boards/{boardId}/clone',
    pathParams: ['boardId'],
    queryParams: [],
    hasBody: true,
  },
  confirmTwoFactorSetup: {
    operationId: 'confirmTwoFactorSetup',
    method: 'post',
    path: '/api/2fa/setup/confirm',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createBoard: {
    operationId: 'createBoard',
    method: 'post',
    path: '/api/boards',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createBoardShare: {
    operationId: 'createBoardShare',
    method: 'post',
    path: '/api/boards/{boardId}/shares',
    pathParams: ['boardId'],
    queryParams: [],
    hasBody: true,
  },
  createLink: {
    operationId: 'createLink',
    method: 'post',
    path: '/api/links',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createLinkShare: {
    operationId: 'createLinkShare',
    method: 'post',
    path: '/api/links/{linkId}/shares',
    pathParams: ['linkId'],
    queryParams: [],
    hasBody: true,
  },
  createMyApiKey: {
    operationId: 'createMyApiKey',
    method: 'post',
    path: '/api/me/api-keys',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createPixel: {
    operationId: 'createPixel',
    method: 'post',
    path: '/api/pixels',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createPixelShare: {
    operationId: 'createPixelShare',
    method: 'post',
    path: '/api/pixels/{pixelId}/shares',
    pathParams: ['pixelId'],
    queryParams: [],
    hasBody: true,
  },
  createReport: {
    operationId: 'createReport',
    method: 'post',
    path: '/api/reports',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createShare: {
    operationId: 'createShare',
    method: 'post',
    path: '/api/share',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createTeam: {
    operationId: 'createTeam',
    method: 'post',
    path: '/api/teams',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createTeamUser: {
    operationId: 'createTeamUser',
    method: 'post',
    path: '/api/teams/{teamId}/users',
    pathParams: ['teamId'],
    queryParams: [],
    hasBody: true,
  },
  createUser: {
    operationId: 'createUser',
    method: 'post',
    path: '/api/users',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createWebsite: {
    operationId: 'createWebsite',
    method: 'post',
    path: '/api/websites',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  createWebsiteAnnotation: {
    operationId: 'createWebsiteAnnotation',
    method: 'post',
    path: '/api/websites/{websiteId}/annotations',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: true,
  },
  createWebsiteSegment: {
    operationId: 'createWebsiteSegment',
    method: 'post',
    path: '/api/websites/{websiteId}/segments',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: true,
  },
  createWebsiteShare: {
    operationId: 'createWebsiteShare',
    method: 'post',
    path: '/api/websites/{websiteId}/shares',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: true,
  },
  deleteBoard: {
    operationId: 'deleteBoard',
    method: 'delete',
    path: '/api/boards/{boardId}',
    pathParams: ['boardId'],
    queryParams: [],
    hasBody: false,
  },
  deleteLink: {
    operationId: 'deleteLink',
    method: 'delete',
    path: '/api/links/{linkId}',
    pathParams: ['linkId'],
    queryParams: [],
    hasBody: false,
  },
  deleteMyApiKey: {
    operationId: 'deleteMyApiKey',
    method: 'delete',
    path: '/api/me/api-keys/{keyId}',
    pathParams: ['keyId'],
    queryParams: [],
    hasBody: false,
  },
  deletePixel: {
    operationId: 'deletePixel',
    method: 'delete',
    path: '/api/pixels/{pixelId}',
    pathParams: ['pixelId'],
    queryParams: [],
    hasBody: false,
  },
  deleteReport: {
    operationId: 'deleteReport',
    method: 'delete',
    path: '/api/reports/{reportId}',
    pathParams: ['reportId'],
    queryParams: [],
    hasBody: false,
  },
  deleteShare: {
    operationId: 'deleteShare',
    method: 'delete',
    path: '/api/share/id/{shareId}',
    pathParams: ['shareId'],
    queryParams: [],
    hasBody: false,
  },
  deleteTeam: {
    operationId: 'deleteTeam',
    method: 'delete',
    path: '/api/teams/{teamId}',
    pathParams: ['teamId'],
    queryParams: [],
    hasBody: false,
  },
  deleteTeamUser: {
    operationId: 'deleteTeamUser',
    method: 'delete',
    path: '/api/teams/{teamId}/users/{userId}',
    pathParams: ['teamId', 'userId'],
    queryParams: [],
    hasBody: false,
  },
  deleteUser: {
    operationId: 'deleteUser',
    method: 'delete',
    path: '/api/users/{userId}',
    pathParams: ['userId'],
    queryParams: [],
    hasBody: false,
  },
  deleteWebsite: {
    operationId: 'deleteWebsite',
    method: 'delete',
    path: '/api/websites/{websiteId}',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: false,
  },
  deleteWebsiteAnnotation: {
    operationId: 'deleteWebsiteAnnotation',
    method: 'delete',
    path: '/api/websites/{websiteId}/annotations/{annotationId}',
    pathParams: ['websiteId', 'annotationId'],
    queryParams: [],
    hasBody: false,
  },
  deleteWebsiteSegment: {
    operationId: 'deleteWebsiteSegment',
    method: 'delete',
    path: '/api/websites/{websiteId}/segments/{segmentId}',
    pathParams: ['websiteId', 'segmentId'],
    queryParams: [],
    hasBody: false,
  },
  deleteWebsiteSession: {
    operationId: 'deleteWebsiteSession',
    method: 'delete',
    path: '/api/websites/{websiteId}/sessions/{sessionId}',
    pathParams: ['websiteId', 'sessionId'],
    queryParams: [],
    hasBody: false,
  },
  disableTwoFactor: {
    operationId: 'disableTwoFactor',
    method: 'post',
    path: '/api/2fa/disable',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  exportWebsite: {
    operationId: 'exportWebsite',
    method: 'get',
    path: '/api/websites/{websiteId}/export',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getBoard: {
    operationId: 'getBoard',
    method: 'get',
    path: '/api/boards/{boardId}',
    pathParams: ['boardId'],
    queryParams: [],
    hasBody: false,
  },
  getBoards: {
    operationId: 'getBoards',
    method: 'get',
    path: '/api/boards',
    pathParams: [],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getBoardShares: {
    operationId: 'getBoardShares',
    method: 'get',
    path: '/api/boards/{boardId}/shares',
    pathParams: ['boardId'],
    queryParams: [
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getEventData: {
    operationId: 'getEventData',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getEventDataArraySeries: {
    operationId: 'getEventDataArraySeries',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data-pivot/array-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'propertyName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataById: {
    operationId: 'getEventDataById',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/{eventId}',
    pathParams: ['websiteId', 'eventId'],
    queryParams: [],
    hasBody: false,
  },
  getEventDataDateSeries: {
    operationId: 'getEventDataDateSeries',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data-pivot/date-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'propertyName',
      'timezone',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataEvents: {
    operationId: 'getEventDataEvents',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/events',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'event',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataFields: {
    operationId: 'getEventDataFields',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/fields',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataNumericSeries: {
    operationId: 'getEventDataNumericSeries',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data-pivot/numeric-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'propertyName',
      'metric',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataNumericStats: {
    operationId: 'getEventDataNumericStats',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data-pivot/numeric-stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'propertyName',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataPivot: {
    operationId: 'getEventDataPivot',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data-pivot',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getEventDataProperties: {
    operationId: 'getEventDataProperties',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/properties',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getEventDataPropertySeries: {
    operationId: 'getEventDataPropertySeries',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data-pivot/property-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'propertyName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getEventDataStats: {
    operationId: 'getEventDataStats',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getEventDataValues: {
    operationId: 'getEventDataValues',
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/values',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'eventName',
      'propertyName',
      'dataType',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getLink: {
    operationId: 'getLink',
    method: 'get',
    path: '/api/links/{linkId}',
    pathParams: ['linkId'],
    queryParams: [],
    hasBody: false,
  },
  getLinks: {
    operationId: 'getLinks',
    method: 'get',
    path: '/api/links',
    pathParams: [],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getLinksCharts: {
    operationId: 'getLinksCharts',
    method: 'get',
    path: '/api/links/charts',
    pathParams: [],
    queryParams: ['ids', 'startAt', 'endAt', 'timezone'],
    hasBody: false,
  },
  getLinkShares: {
    operationId: 'getLinkShares',
    method: 'get',
    path: '/api/links/{linkId}/shares',
    pathParams: ['linkId'],
    queryParams: [
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getMe: {
    operationId: 'getMe',
    method: 'get',
    path: '/api/me',
    pathParams: [],
    queryParams: [],
    hasBody: false,
    scope: 'websites:read',
  },
  getMyApiKeys: {
    operationId: 'getMyApiKeys',
    method: 'get',
    path: '/api/me/api-keys',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  getMyTeams: {
    operationId: 'getMyTeams',
    method: 'get',
    path: '/api/me/teams',
    pathParams: [],
    queryParams: ['page', 'pageSize', 'maxResults', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getMyWebsites: {
    operationId: 'getMyWebsites',
    method: 'get',
    path: '/api/me/websites',
    pathParams: [],
    queryParams: ['page', 'pageSize', 'maxResults', 'orderBy', 'sortDescending', 'includeTeams'],
    hasBody: false,
  },
  getPixel: {
    operationId: 'getPixel',
    method: 'get',
    path: '/api/pixels/{pixelId}',
    pathParams: ['pixelId'],
    queryParams: [],
    hasBody: false,
  },
  getPixels: {
    operationId: 'getPixels',
    method: 'get',
    path: '/api/pixels',
    pathParams: [],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getPixelsCharts: {
    operationId: 'getPixelsCharts',
    method: 'get',
    path: '/api/pixels/charts',
    pathParams: [],
    queryParams: ['ids', 'startAt', 'endAt', 'timezone'],
    hasBody: false,
  },
  getPixelShares: {
    operationId: 'getPixelShares',
    method: 'get',
    path: '/api/pixels/{pixelId}/shares',
    pathParams: ['pixelId'],
    queryParams: [
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getRealtime: {
    operationId: 'getRealtime',
    method: 'get',
    path: '/api/realtime/{websiteId}',
    pathParams: ['websiteId'],
    queryParams: [
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getReport: {
    operationId: 'getReport',
    method: 'get',
    path: '/api/reports/{reportId}',
    pathParams: ['reportId'],
    queryParams: [],
    hasBody: false,
  },
  getReports: {
    operationId: 'getReports',
    method: 'get',
    path: '/api/reports',
    pathParams: [],
    queryParams: ['websiteId', 'type', 'page', 'pageSize', 'maxResults'],
    hasBody: false,
  },
  getSessionDataArraySeries: {
    operationId: 'getSessionDataArraySeries',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/array-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataDateSeries: {
    operationId: 'getSessionDataDateSeries',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/date-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'timezone',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataNumericSeries: {
    operationId: 'getSessionDataNumericSeries',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/numeric-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'metric',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataNumericStats: {
    operationId: 'getSessionDataNumericStats',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/numeric-stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'timezone',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataPivot: {
    operationId: 'getSessionDataPivot',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data-pivot',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getSessionDataProperties: {
    operationId: 'getSessionDataProperties',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/properties',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataPropertySeries: {
    operationId: 'getSessionDataPropertySeries',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/property-series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataStats: {
    operationId: 'getSessionDataStats',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'timezone',
      'unit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getSessionDataValues: {
    operationId: 'getSessionDataValues',
    method: 'get',
    path: '/api/websites/{websiteId}/session-data/values',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'propertyName',
      'dataType',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getShare: {
    operationId: 'getShare',
    method: 'get',
    path: '/api/share/id/{shareId}',
    pathParams: ['shareId'],
    queryParams: [],
    hasBody: false,
  },
  getShareBySlug: {
    operationId: 'getShareBySlug',
    method: 'get',
    path: '/api/share/{slug}',
    pathParams: ['slug'],
    queryParams: [],
    hasBody: false,
  },
  getSubscription: {
    operationId: 'getSubscription',
    method: 'get',
    path: '/api/auth/subscription',
    pathParams: [],
    queryParams: ['teamId'],
    hasBody: false,
  },
  getTeam: {
    operationId: 'getTeam',
    method: 'get',
    path: '/api/teams/{teamId}',
    pathParams: ['teamId'],
    queryParams: [],
    hasBody: false,
  },
  getTeamBoards: {
    operationId: 'getTeamBoards',
    method: 'get',
    path: '/api/teams/{teamId}/boards',
    pathParams: ['teamId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getTeamLinks: {
    operationId: 'getTeamLinks',
    method: 'get',
    path: '/api/teams/{teamId}/links',
    pathParams: ['teamId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getTeamPixels: {
    operationId: 'getTeamPixels',
    method: 'get',
    path: '/api/teams/{teamId}/pixels',
    pathParams: ['teamId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getTeams: {
    operationId: 'getTeams',
    method: 'get',
    path: '/api/teams',
    pathParams: [],
    queryParams: ['page', 'pageSize', 'maxResults', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getTeamUser: {
    operationId: 'getTeamUser',
    method: 'get',
    path: '/api/teams/{teamId}/users/{userId}',
    pathParams: ['teamId', 'userId'],
    queryParams: [],
    hasBody: false,
  },
  getTeamUsers: {
    operationId: 'getTeamUsers',
    method: 'get',
    path: '/api/teams/{teamId}/users',
    pathParams: ['teamId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'search'],
    hasBody: false,
  },
  getTeamWebsites: {
    operationId: 'getTeamWebsites',
    method: 'get',
    path: '/api/teams/{teamId}/websites',
    pathParams: ['teamId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'search', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getTwoFactorStatus: {
    operationId: 'getTwoFactorStatus',
    method: 'get',
    path: '/api/2fa/status',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  getUser: {
    operationId: 'getUser',
    method: 'get',
    path: '/api/users/{userId}',
    pathParams: ['userId'],
    queryParams: [],
    hasBody: false,
  },
  getUserTeams: {
    operationId: 'getUserTeams',
    method: 'get',
    path: '/api/users/{userId}/teams',
    pathParams: ['userId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'orderBy', 'sortDescending'],
    hasBody: false,
  },
  getUserWebsites: {
    operationId: 'getUserWebsites',
    method: 'get',
    path: '/api/users/{userId}/websites',
    pathParams: ['userId'],
    queryParams: [
      'page',
      'pageSize',
      'maxResults',
      'search',
      'orderBy',
      'sortDescending',
      'includeTeams',
    ],
    hasBody: false,
  },
  getWebsite: {
    operationId: 'getWebsite',
    method: 'get',
    path: '/api/websites/{websiteId}',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: false,
    scope: 'websites:read',
  },
  getWebsiteActive: {
    operationId: 'getWebsiteActive',
    method: 'get',
    path: '/api/websites/{websiteId}/active',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteAnnotation: {
    operationId: 'getWebsiteAnnotation',
    method: 'get',
    path: '/api/websites/{websiteId}/annotations/{annotationId}',
    pathParams: ['websiteId', 'annotationId'],
    queryParams: [],
    hasBody: false,
  },
  getWebsiteAnnotations: {
    operationId: 'getWebsiteAnnotations',
    method: 'get',
    path: '/api/websites/{websiteId}/annotations',
    pathParams: ['websiteId'],
    queryParams: ['startAt', 'endAt', 'search', 'page', 'pageSize', 'maxResults'],
    hasBody: false,
  },
  getWebsiteDateRange: {
    operationId: 'getWebsiteDateRange',
    method: 'get',
    path: '/api/websites/{websiteId}/daterange',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteEvents: {
    operationId: 'getWebsiteEvents',
    method: 'get',
    path: '/api/websites/{websiteId}/events',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'segment',
      'cohort',
      'eventType',
      'excludeBounce',
      'match',
      'page',
      'pageSize',
      'maxResults',
      'search',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteEventSeries: {
    operationId: 'getWebsiteEventSeries',
    method: 'get',
    path: '/api/websites/{websiteId}/events/series',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'unit',
      'timezone',
      'limit',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteEventStats: {
    operationId: 'getWebsiteEventStats',
    method: 'get',
    path: '/api/websites/{websiteId}/events/stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteExpandedMetrics: {
    operationId: 'getWebsiteExpandedMetrics',
    method: 'get',
    path: '/api/websites/{websiteId}/metrics/expanded',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'type',
      'limit',
      'offset',
      'search',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteMetrics: {
    operationId: 'getWebsiteMetrics',
    method: 'get',
    path: '/api/websites/{websiteId}/metrics',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'type',
      'limit',
      'offset',
      'search',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'segment',
      'cohort',
      'eventType',
      'excludeBounce',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsitePageviews: {
    operationId: 'getWebsitePageviews',
    method: 'get',
    path: '/api/websites/{websiteId}/pageviews',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'segment',
      'cohort',
      'eventType',
      'excludeBounce',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteRecorderConfig: {
    operationId: 'getWebsiteRecorderConfig',
    method: 'get',
    path: '/api/websites/{websiteId}/recorder',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: false,
  },
  getWebsiteReplay: {
    operationId: 'getWebsiteReplay',
    method: 'get',
    path: '/api/websites/{websiteId}/replays/{replayId}',
    pathParams: ['websiteId', 'replayId'],
    queryParams: [],
    hasBody: false,
  },
  getWebsiteReplays: {
    operationId: 'getWebsiteReplays',
    method: 'get',
    path: '/api/websites/{websiteId}/replays',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'minDuration',
      'page',
      'pageSize',
      'maxResults',
      'search',
    ],
    hasBody: false,
  },
  getWebsiteReplaySaved: {
    operationId: 'getWebsiteReplaySaved',
    method: 'get',
    path: '/api/websites/{websiteId}/replays/saved/{replayId}',
    pathParams: ['websiteId', 'replayId'],
    queryParams: [],
    hasBody: false,
  },
  getWebsiteReports: {
    operationId: 'getWebsiteReports',
    method: 'get',
    path: '/api/websites/{websiteId}/reports',
    pathParams: ['websiteId'],
    queryParams: ['type', 'page', 'pageSize', 'maxResults'],
    hasBody: false,
  },
  getWebsiteRevenueChart: {
    operationId: 'getWebsiteRevenueChart',
    method: 'get',
    path: '/api/websites/{websiteId}/revenue/chart',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'currency',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getWebsiteRevenueMetrics: {
    operationId: 'getWebsiteRevenueMetrics',
    method: 'get',
    path: '/api/websites/{websiteId}/revenue/metrics',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'type',
      'currency',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getWebsiteRevenueSessions: {
    operationId: 'getWebsiteRevenueSessions',
    method: 'get',
    path: '/api/websites/{websiteId}/revenue/sessions',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'currency',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
      'search',
    ],
    hasBody: false,
  },
  getWebsiteRevenueStats: {
    operationId: 'getWebsiteRevenueStats',
    method: 'get',
    path: '/api/websites/{websiteId}/revenue/stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'currency',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getWebsiteSavedReplays: {
    operationId: 'getWebsiteSavedReplays',
    method: 'get',
    path: '/api/websites/{websiteId}/replays/saved',
    pathParams: ['websiteId'],
    queryParams: ['page', 'pageSize', 'maxResults', 'search'],
    hasBody: false,
  },
  getWebsitesCharts: {
    operationId: 'getWebsitesCharts',
    method: 'get',
    path: '/api/websites/charts',
    pathParams: [],
    queryParams: ['ids', 'startAt', 'endAt', 'timezone'],
    hasBody: false,
  },
  getWebsiteSegment: {
    operationId: 'getWebsiteSegment',
    method: 'get',
    path: '/api/websites/{websiteId}/segments/{segmentId}',
    pathParams: ['websiteId', 'segmentId'],
    queryParams: [],
    hasBody: false,
  },
  getWebsiteSegments: {
    operationId: 'getWebsiteSegments',
    method: 'get',
    path: '/api/websites/{websiteId}/segments',
    pathParams: ['websiteId'],
    queryParams: ['type', 'search'],
    hasBody: false,
  },
  getWebsiteSession: {
    operationId: 'getWebsiteSession',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}',
    pathParams: ['websiteId', 'sessionId'],
    queryParams: [],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteSessionActivity: {
    operationId: 'getWebsiteSessionActivity',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/activity',
    pathParams: ['websiteId', 'sessionId'],
    queryParams: ['startAt', 'endAt', 'distinctId'],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteSessionProperties: {
    operationId: 'getWebsiteSessionProperties',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/properties',
    pathParams: ['websiteId', 'sessionId'],
    queryParams: [],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteSessionReplays: {
    operationId: 'getWebsiteSessionReplays',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/replays',
    pathParams: ['websiteId', 'sessionId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'page',
      'pageSize',
      'maxResults',
      'search',
    ],
    hasBody: false,
  },
  getWebsiteSessions: {
    operationId: 'getWebsiteSessions',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'segment',
      'cohort',
      'eventType',
      'excludeBounce',
      'match',
      'page',
      'pageSize',
      'maxResults',
      'search',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteSessionStats: {
    operationId: 'getWebsiteSessionStats',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteSessionsWeekly: {
    operationId: 'getWebsiteSessionsWeekly',
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/weekly',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'timezone',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
    ],
    hasBody: false,
  },
  getWebsiteShares: {
    operationId: 'getWebsiteShares',
    method: 'get',
    path: '/api/websites/{websiteId}/shares',
    pathParams: ['websiteId'],
    queryParams: [
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'excludeBounce',
      'segment',
      'cohort',
      'eventType',
      'match',
      'page',
      'pageSize',
      'maxResults',
    ],
    hasBody: false,
  },
  getWebsiteStats: {
    operationId: 'getWebsiteStats',
    method: 'get',
    path: '/api/websites/{websiteId}/stats',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'path',
      'referrer',
      'title',
      'query',
      'os',
      'browser',
      'device',
      'country',
      'region',
      'city',
      'tag',
      'hostname',
      'distinctId',
      'language',
      'event',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'segment',
      'cohort',
      'eventType',
      'excludeBounce',
      'match',
    ],
    hasBody: false,
    scope: 'analytics:read',
  },
  getWebsiteValues: {
    operationId: 'getWebsiteValues',
    method: 'get',
    path: '/api/websites/{websiteId}/values',
    pathParams: ['websiteId'],
    queryParams: [
      'startAt',
      'endAt',
      'startDate',
      'endDate',
      'timezone',
      'unit',
      'compare',
      'type',
      'search',
    ],
    hasBody: false,
  },
  initiateTwoFactorSetup: {
    operationId: 'initiateTwoFactorSetup',
    method: 'post',
    path: '/api/2fa/setup/initiate',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  joinTeam: {
    operationId: 'joinTeam',
    method: 'post',
    path: '/api/teams/join',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  listWebsites: {
    operationId: 'listWebsites',
    method: 'get',
    path: '/api/websites',
    pathParams: [],
    queryParams: [
      'page',
      'pageSize',
      'maxResults',
      'search',
      'orderBy',
      'sortDescending',
      'includeTeams',
    ],
    hasBody: false,
    scope: 'websites:read',
  },
  login: {
    operationId: 'login',
    method: 'post',
    path: '/api/auth/login',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  logout: {
    operationId: 'logout',
    method: 'post',
    path: '/api/auth/logout',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  record: {
    operationId: 'record',
    method: 'post',
    path: '/api/record',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  resetWebsite: {
    operationId: 'resetWebsite',
    method: 'post',
    path: '/api/websites/{websiteId}/reset',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: false,
  },
  runAttributionReport: {
    operationId: 'runAttributionReport',
    method: 'post',
    path: '/api/reports/attribution',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  runBreakdownReport: {
    operationId: 'runBreakdownReport',
    method: 'post',
    path: '/api/reports/breakdown',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  runFunnelReport: {
    operationId: 'runFunnelReport',
    method: 'post',
    path: '/api/reports/funnel',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  runGoalReport: {
    operationId: 'runGoalReport',
    method: 'post',
    path: '/api/reports/goal',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  runHeatmapReport: {
    operationId: 'runHeatmapReport',
    method: 'post',
    path: '/api/reports/heatmap',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  runJourneyReport: {
    operationId: 'runJourneyReport',
    method: 'post',
    path: '/api/reports/journey',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  runPerformanceReport: {
    operationId: 'runPerformanceReport',
    method: 'post',
    path: '/api/reports/performance',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  runRetentionReport: {
    operationId: 'runRetentionReport',
    method: 'post',
    path: '/api/reports/retention',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  runRevenueReport: {
    operationId: 'runRevenueReport',
    method: 'post',
    path: '/api/reports/revenue',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  runUtmReport: {
    operationId: 'runUtmReport',
    method: 'post',
    path: '/api/reports/utm',
    pathParams: [],
    queryParams: [],
    hasBody: true,
    scope: 'analytics:read',
  },
  saveWebsiteReplay: {
    operationId: 'saveWebsiteReplay',
    method: 'post',
    path: '/api/websites/{websiteId}/replays/saved/{replayId}',
    pathParams: ['websiteId', 'replayId'],
    queryParams: [],
    hasBody: true,
  },
  send: {
    operationId: 'send',
    method: 'post',
    path: '/api/send',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  sso: {
    operationId: 'sso',
    method: 'post',
    path: '/api/auth/sso',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  transferWebsite: {
    operationId: 'transferWebsite',
    method: 'post',
    path: '/api/websites/{websiteId}/transfer',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: true,
  },
  updateBoard: {
    operationId: 'updateBoard',
    method: 'post',
    path: '/api/boards/{boardId}',
    pathParams: ['boardId'],
    queryParams: [],
    hasBody: true,
  },
  updateLink: {
    operationId: 'updateLink',
    method: 'post',
    path: '/api/links/{linkId}',
    pathParams: ['linkId'],
    queryParams: [],
    hasBody: true,
  },
  updateMyPassword: {
    operationId: 'updateMyPassword',
    method: 'post',
    path: '/api/me/password',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
  updatePixel: {
    operationId: 'updatePixel',
    method: 'post',
    path: '/api/pixels/{pixelId}',
    pathParams: ['pixelId'],
    queryParams: [],
    hasBody: true,
  },
  updateReport: {
    operationId: 'updateReport',
    method: 'post',
    path: '/api/reports/{reportId}',
    pathParams: ['reportId'],
    queryParams: [],
    hasBody: true,
  },
  updateShare: {
    operationId: 'updateShare',
    method: 'post',
    path: '/api/share/id/{shareId}',
    pathParams: ['shareId'],
    queryParams: [],
    hasBody: true,
  },
  updateTeam: {
    operationId: 'updateTeam',
    method: 'post',
    path: '/api/teams/{teamId}',
    pathParams: ['teamId'],
    queryParams: [],
    hasBody: true,
  },
  updateTeamUser: {
    operationId: 'updateTeamUser',
    method: 'post',
    path: '/api/teams/{teamId}/users/{userId}',
    pathParams: ['teamId', 'userId'],
    queryParams: [],
    hasBody: true,
  },
  updateUser: {
    operationId: 'updateUser',
    method: 'post',
    path: '/api/users/{userId}',
    pathParams: ['userId'],
    queryParams: [],
    hasBody: true,
  },
  updateWebsite: {
    operationId: 'updateWebsite',
    method: 'post',
    path: '/api/websites/{websiteId}',
    pathParams: ['websiteId'],
    queryParams: [],
    hasBody: true,
  },
  updateWebsiteAnnotation: {
    operationId: 'updateWebsiteAnnotation',
    method: 'post',
    path: '/api/websites/{websiteId}/annotations/{annotationId}',
    pathParams: ['websiteId', 'annotationId'],
    queryParams: [],
    hasBody: true,
  },
  updateWebsiteSegment: {
    operationId: 'updateWebsiteSegment',
    method: 'post',
    path: '/api/websites/{websiteId}/segments/{segmentId}',
    pathParams: ['websiteId', 'segmentId'],
    queryParams: [],
    hasBody: true,
  },
  verify: {
    operationId: 'verify',
    method: 'post',
    path: '/api/auth/verify',
    pathParams: [],
    queryParams: [],
    hasBody: false,
  },
  verifyTwoFactor: {
    operationId: 'verifyTwoFactor',
    method: 'post',
    path: '/api/2fa/verify',
    pathParams: [],
    queryParams: [],
    hasBody: true,
  },
} as const satisfies Record<string, OperationDefinition>;

export type OperationId = keyof typeof operations;

export type Schemas = components['schemas'];

type Clean<T> = [T] extends [never] ? Record<never, never> : T;

type OperationPathParams<K extends OperationId> = OperationTypes[K]['parameters'] extends {
  path: infer P;
}
  ? Clean<P>
  : Record<never, never>;

type OperationQuery<K extends OperationId> = Clean<
  NonNullable<OperationTypes[K]['parameters']['query']>
>;

type OperationBody<K extends OperationId> = OperationTypes[K] extends { requestBody?: infer R }
  ? NonNullable<R> extends { content: { 'application/json': infer B } }
    ? Clean<B>
    : Record<never, never>
  : Record<never, never>;

export type OperationInput<K extends OperationId> = OperationPathParams<K> &
  OperationQuery<K> &
  OperationBody<K> &
  Record<string, unknown>;

export type OperationOutput<K extends OperationId> = OperationTypes[K]['responses'] extends {
  200: { content: { 'application/json': infer R } };
}
  ? R
  : unknown;

export abstract class GeneratedUmamiClient {
  protected abstract execute<K extends OperationId>(
    operationId: K,
    input: Record<string, unknown> | undefined,
    options?: RequestOptions,
  ): Promise<OperationOutput<K>>;

  /**
   * Create or update batch
   * `POST /api/batch`
   */
  batch(
    input: OperationInput<'batch'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'batch'>> {
    return this.execute('batch', input, options);
  }

  /**
   * Create or update 2fa setup cancel
   * `POST /api/2fa/setup/cancel`
   */
  cancelTwoFactorSetup(
    input?: OperationInput<'cancelTwoFactorSetup'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'cancelTwoFactorSetup'>> {
    return this.execute('cancelTwoFactorSetup', input, options);
  }

  /**
   * Create or update boards board id clone
   * `POST /api/boards/{boardId}/clone`
   */
  cloneBoard(
    input: OperationInput<'cloneBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'cloneBoard'>> {
    return this.execute('cloneBoard', input, options);
  }

  /**
   * Create or update 2fa setup confirm
   * `POST /api/2fa/setup/confirm`
   */
  confirmTwoFactorSetup(
    input: OperationInput<'confirmTwoFactorSetup'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'confirmTwoFactorSetup'>> {
    return this.execute('confirmTwoFactorSetup', input, options);
  }

  /**
   * Create or update boards
   * `POST /api/boards`
   */
  createBoard(
    input: OperationInput<'createBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createBoard'>> {
    return this.execute('createBoard', input, options);
  }

  /**
   * Create or update boards board id shares
   * `POST /api/boards/{boardId}/shares`
   */
  createBoardShare(
    input: OperationInput<'createBoardShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createBoardShare'>> {
    return this.execute('createBoardShare', input, options);
  }

  /**
   * Create or update links
   * `POST /api/links`
   */
  createLink(
    input: OperationInput<'createLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createLink'>> {
    return this.execute('createLink', input, options);
  }

  /**
   * Create or update links link id shares
   * `POST /api/links/{linkId}/shares`
   */
  createLinkShare(
    input: OperationInput<'createLinkShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createLinkShare'>> {
    return this.execute('createLinkShare', input, options);
  }

  /**
   * Create or update me api keys
   * `POST /api/me/api-keys`
   */
  createMyApiKey(
    input: OperationInput<'createMyApiKey'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createMyApiKey'>> {
    return this.execute('createMyApiKey', input, options);
  }

  /**
   * Create or update pixels
   * `POST /api/pixels`
   */
  createPixel(
    input: OperationInput<'createPixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createPixel'>> {
    return this.execute('createPixel', input, options);
  }

  /**
   * Create or update pixels pixel id shares
   * `POST /api/pixels/{pixelId}/shares`
   */
  createPixelShare(
    input: OperationInput<'createPixelShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createPixelShare'>> {
    return this.execute('createPixelShare', input, options);
  }

  /**
   * Create or update reports
   * `POST /api/reports`
   */
  createReport(
    input: OperationInput<'createReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createReport'>> {
    return this.execute('createReport', input, options);
  }

  /**
   * Create or update share
   * `POST /api/share`
   */
  createShare(
    input: OperationInput<'createShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createShare'>> {
    return this.execute('createShare', input, options);
  }

  /**
   * Create or update teams
   * `POST /api/teams`
   */
  createTeam(
    input: OperationInput<'createTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createTeam'>> {
    return this.execute('createTeam', input, options);
  }

  /**
   * Create or update teams team id users
   * `POST /api/teams/{teamId}/users`
   */
  createTeamUser(
    input: OperationInput<'createTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createTeamUser'>> {
    return this.execute('createTeamUser', input, options);
  }

  /**
   * Create or update users
   * `POST /api/users`
   */
  createUser(
    input: OperationInput<'createUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createUser'>> {
    return this.execute('createUser', input, options);
  }

  /**
   * Create a website
   * `POST /api/websites`
   */
  createWebsite(
    input: OperationInput<'createWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsite'>> {
    return this.execute('createWebsite', input, options);
  }

  /**
   * Create or update websites website id annotations
   * `POST /api/websites/{websiteId}/annotations`
   */
  createWebsiteAnnotation(
    input: OperationInput<'createWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsiteAnnotation'>> {
    return this.execute('createWebsiteAnnotation', input, options);
  }

  /**
   * Create or update websites website id segments
   * `POST /api/websites/{websiteId}/segments`
   */
  createWebsiteSegment(
    input: OperationInput<'createWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsiteSegment'>> {
    return this.execute('createWebsiteSegment', input, options);
  }

  /**
   * Create or update websites website id shares
   * `POST /api/websites/{websiteId}/shares`
   */
  createWebsiteShare(
    input: OperationInput<'createWebsiteShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsiteShare'>> {
    return this.execute('createWebsiteShare', input, options);
  }

  /**
   * Delete boards board id
   * `DELETE /api/boards/{boardId}`
   */
  deleteBoard(
    input: OperationInput<'deleteBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteBoard'>> {
    return this.execute('deleteBoard', input, options);
  }

  /**
   * Delete links link id
   * `DELETE /api/links/{linkId}`
   */
  deleteLink(
    input: OperationInput<'deleteLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteLink'>> {
    return this.execute('deleteLink', input, options);
  }

  /**
   * Delete me api keys key id
   * `DELETE /api/me/api-keys/{keyId}`
   */
  deleteMyApiKey(
    input: OperationInput<'deleteMyApiKey'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteMyApiKey'>> {
    return this.execute('deleteMyApiKey', input, options);
  }

  /**
   * Delete pixels pixel id
   * `DELETE /api/pixels/{pixelId}`
   */
  deletePixel(
    input: OperationInput<'deletePixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deletePixel'>> {
    return this.execute('deletePixel', input, options);
  }

  /**
   * Delete reports report id
   * `DELETE /api/reports/{reportId}`
   */
  deleteReport(
    input: OperationInput<'deleteReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteReport'>> {
    return this.execute('deleteReport', input, options);
  }

  /**
   * Delete share id share id
   * `DELETE /api/share/id/{shareId}`
   */
  deleteShare(
    input: OperationInput<'deleteShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteShare'>> {
    return this.execute('deleteShare', input, options);
  }

  /**
   * Delete teams team id
   * `DELETE /api/teams/{teamId}`
   */
  deleteTeam(
    input: OperationInput<'deleteTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteTeam'>> {
    return this.execute('deleteTeam', input, options);
  }

  /**
   * Delete teams team id users user id
   * `DELETE /api/teams/{teamId}/users/{userId}`
   */
  deleteTeamUser(
    input: OperationInput<'deleteTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteTeamUser'>> {
    return this.execute('deleteTeamUser', input, options);
  }

  /**
   * Delete users user id
   * `DELETE /api/users/{userId}`
   */
  deleteUser(
    input: OperationInput<'deleteUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteUser'>> {
    return this.execute('deleteUser', input, options);
  }

  /**
   * Delete a website
   * `DELETE /api/websites/{websiteId}`
   */
  deleteWebsite(
    input: OperationInput<'deleteWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsite'>> {
    return this.execute('deleteWebsite', input, options);
  }

  /**
   * Delete websites website id annotations annotation id
   * `DELETE /api/websites/{websiteId}/annotations/{annotationId}`
   */
  deleteWebsiteAnnotation(
    input: OperationInput<'deleteWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsiteAnnotation'>> {
    return this.execute('deleteWebsiteAnnotation', input, options);
  }

  /**
   * Delete websites website id segments segment id
   * `DELETE /api/websites/{websiteId}/segments/{segmentId}`
   */
  deleteWebsiteSegment(
    input: OperationInput<'deleteWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsiteSegment'>> {
    return this.execute('deleteWebsiteSegment', input, options);
  }

  /**
   * Delete websites website id sessions session id
   * `DELETE /api/websites/{websiteId}/sessions/{sessionId}`
   */
  deleteWebsiteSession(
    input: OperationInput<'deleteWebsiteSession'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsiteSession'>> {
    return this.execute('deleteWebsiteSession', input, options);
  }

  /**
   * Create or update 2fa disable
   * `POST /api/2fa/disable`
   */
  disableTwoFactor(
    input: OperationInput<'disableTwoFactor'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'disableTwoFactor'>> {
    return this.execute('disableTwoFactor', input, options);
  }

  /**
   * Get websites website id export
   * `GET /api/websites/{websiteId}/export`
   */
  exportWebsite(
    input: OperationInput<'exportWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'exportWebsite'>> {
    return this.execute('exportWebsite', input, options);
  }

  /**
   * Get boards board id
   * `GET /api/boards/{boardId}`
   */
  getBoard(
    input: OperationInput<'getBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getBoard'>> {
    return this.execute('getBoard', input, options);
  }

  /**
   * Get boards
   * `GET /api/boards`
   */
  getBoards(
    input?: OperationInput<'getBoards'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getBoards'>> {
    return this.execute('getBoards', input, options);
  }

  /**
   * Get boards board id shares
   * `GET /api/boards/{boardId}/shares`
   */
  getBoardShares(
    input: OperationInput<'getBoardShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getBoardShares'>> {
    return this.execute('getBoardShares', input, options);
  }

  /**
   * Get websites website id event data
   * `GET /api/websites/{websiteId}/event-data`
   * OAuth scope: `analytics:read`
   */
  getEventData(
    input: OperationInput<'getEventData'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventData'>> {
    return this.execute('getEventData', input, options);
  }

  /**
   * Get websites website id event data pivot array series
   * `GET /api/websites/{websiteId}/event-data-pivot/array-series`
   */
  getEventDataArraySeries(
    input: OperationInput<'getEventDataArraySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataArraySeries'>> {
    return this.execute('getEventDataArraySeries', input, options);
  }

  /**
   * Get websites website id event data event id
   * `GET /api/websites/{websiteId}/event-data/{eventId}`
   */
  getEventDataById(
    input: OperationInput<'getEventDataById'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataById'>> {
    return this.execute('getEventDataById', input, options);
  }

  /**
   * Get websites website id event data pivot date series
   * `GET /api/websites/{websiteId}/event-data-pivot/date-series`
   */
  getEventDataDateSeries(
    input: OperationInput<'getEventDataDateSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataDateSeries'>> {
    return this.execute('getEventDataDateSeries', input, options);
  }

  /**
   * Get websites website id event data events
   * `GET /api/websites/{websiteId}/event-data/events`
   */
  getEventDataEvents(
    input: OperationInput<'getEventDataEvents'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataEvents'>> {
    return this.execute('getEventDataEvents', input, options);
  }

  /**
   * Get websites website id event data fields
   * `GET /api/websites/{websiteId}/event-data/fields`
   */
  getEventDataFields(
    input: OperationInput<'getEventDataFields'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataFields'>> {
    return this.execute('getEventDataFields', input, options);
  }

  /**
   * Get websites website id event data pivot numeric series
   * `GET /api/websites/{websiteId}/event-data-pivot/numeric-series`
   */
  getEventDataNumericSeries(
    input: OperationInput<'getEventDataNumericSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataNumericSeries'>> {
    return this.execute('getEventDataNumericSeries', input, options);
  }

  /**
   * Get websites website id event data pivot numeric stats
   * `GET /api/websites/{websiteId}/event-data-pivot/numeric-stats`
   */
  getEventDataNumericStats(
    input: OperationInput<'getEventDataNumericStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataNumericStats'>> {
    return this.execute('getEventDataNumericStats', input, options);
  }

  /**
   * Get websites website id event data pivot
   * `GET /api/websites/{websiteId}/event-data-pivot`
   */
  getEventDataPivot(
    input: OperationInput<'getEventDataPivot'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataPivot'>> {
    return this.execute('getEventDataPivot', input, options);
  }

  /**
   * Get websites website id event data properties
   * `GET /api/websites/{websiteId}/event-data/properties`
   * OAuth scope: `analytics:read`
   */
  getEventDataProperties(
    input: OperationInput<'getEventDataProperties'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataProperties'>> {
    return this.execute('getEventDataProperties', input, options);
  }

  /**
   * Get websites website id event data pivot property series
   * `GET /api/websites/{websiteId}/event-data-pivot/property-series`
   */
  getEventDataPropertySeries(
    input: OperationInput<'getEventDataPropertySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataPropertySeries'>> {
    return this.execute('getEventDataPropertySeries', input, options);
  }

  /**
   * Get websites website id event data stats
   * `GET /api/websites/{websiteId}/event-data/stats`
   * OAuth scope: `analytics:read`
   */
  getEventDataStats(
    input: OperationInput<'getEventDataStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataStats'>> {
    return this.execute('getEventDataStats', input, options);
  }

  /**
   * Get websites website id event data values
   * `GET /api/websites/{websiteId}/event-data/values`
   * OAuth scope: `analytics:read`
   */
  getEventDataValues(
    input: OperationInput<'getEventDataValues'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataValues'>> {
    return this.execute('getEventDataValues', input, options);
  }

  /**
   * Get links link id
   * `GET /api/links/{linkId}`
   */
  getLink(
    input: OperationInput<'getLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLink'>> {
    return this.execute('getLink', input, options);
  }

  /**
   * Get links
   * `GET /api/links`
   */
  getLinks(
    input?: OperationInput<'getLinks'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLinks'>> {
    return this.execute('getLinks', input, options);
  }

  /**
   * Get links charts
   * `GET /api/links/charts`
   */
  getLinksCharts(
    input: OperationInput<'getLinksCharts'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLinksCharts'>> {
    return this.execute('getLinksCharts', input, options);
  }

  /**
   * Get links link id shares
   * `GET /api/links/{linkId}/shares`
   */
  getLinkShares(
    input: OperationInput<'getLinkShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLinkShares'>> {
    return this.execute('getLinkShares', input, options);
  }

  /**
   * Get me
   * `GET /api/me`
   * OAuth scope: `websites:read`
   */
  getMe(
    input?: OperationInput<'getMe'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMe'>> {
    return this.execute('getMe', input, options);
  }

  /**
   * Get me api keys
   * `GET /api/me/api-keys`
   */
  getMyApiKeys(
    input?: OperationInput<'getMyApiKeys'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMyApiKeys'>> {
    return this.execute('getMyApiKeys', input, options);
  }

  /**
   * Get me teams
   * `GET /api/me/teams`
   */
  getMyTeams(
    input?: OperationInput<'getMyTeams'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMyTeams'>> {
    return this.execute('getMyTeams', input, options);
  }

  /**
   * Get me websites
   * `GET /api/me/websites`
   */
  getMyWebsites(
    input?: OperationInput<'getMyWebsites'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMyWebsites'>> {
    return this.execute('getMyWebsites', input, options);
  }

  /**
   * Get pixels pixel id
   * `GET /api/pixels/{pixelId}`
   */
  getPixel(
    input: OperationInput<'getPixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixel'>> {
    return this.execute('getPixel', input, options);
  }

  /**
   * Get pixels
   * `GET /api/pixels`
   */
  getPixels(
    input?: OperationInput<'getPixels'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixels'>> {
    return this.execute('getPixels', input, options);
  }

  /**
   * Get pixels charts
   * `GET /api/pixels/charts`
   */
  getPixelsCharts(
    input: OperationInput<'getPixelsCharts'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixelsCharts'>> {
    return this.execute('getPixelsCharts', input, options);
  }

  /**
   * Get pixels pixel id shares
   * `GET /api/pixels/{pixelId}/shares`
   */
  getPixelShares(
    input: OperationInput<'getPixelShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixelShares'>> {
    return this.execute('getPixelShares', input, options);
  }

  /**
   * Get realtime website id
   * `GET /api/realtime/{websiteId}`
   * OAuth scope: `analytics:read`
   */
  getRealtime(
    input: OperationInput<'getRealtime'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getRealtime'>> {
    return this.execute('getRealtime', input, options);
  }

  /**
   * Get reports report id
   * `GET /api/reports/{reportId}`
   */
  getReport(
    input: OperationInput<'getReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getReport'>> {
    return this.execute('getReport', input, options);
  }

  /**
   * Get reports
   * `GET /api/reports`
   */
  getReports(
    input: OperationInput<'getReports'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getReports'>> {
    return this.execute('getReports', input, options);
  }

  /**
   * Get websites website id session data array series
   * `GET /api/websites/{websiteId}/session-data/array-series`
   */
  getSessionDataArraySeries(
    input: OperationInput<'getSessionDataArraySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataArraySeries'>> {
    return this.execute('getSessionDataArraySeries', input, options);
  }

  /**
   * Get websites website id session data date series
   * `GET /api/websites/{websiteId}/session-data/date-series`
   */
  getSessionDataDateSeries(
    input: OperationInput<'getSessionDataDateSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataDateSeries'>> {
    return this.execute('getSessionDataDateSeries', input, options);
  }

  /**
   * Get websites website id session data numeric series
   * `GET /api/websites/{websiteId}/session-data/numeric-series`
   */
  getSessionDataNumericSeries(
    input: OperationInput<'getSessionDataNumericSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataNumericSeries'>> {
    return this.execute('getSessionDataNumericSeries', input, options);
  }

  /**
   * Get websites website id session data numeric stats
   * `GET /api/websites/{websiteId}/session-data/numeric-stats`
   */
  getSessionDataNumericStats(
    input: OperationInput<'getSessionDataNumericStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataNumericStats'>> {
    return this.execute('getSessionDataNumericStats', input, options);
  }

  /**
   * Get websites website id session data pivot
   * `GET /api/websites/{websiteId}/session-data-pivot`
   */
  getSessionDataPivot(
    input: OperationInput<'getSessionDataPivot'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataPivot'>> {
    return this.execute('getSessionDataPivot', input, options);
  }

  /**
   * Get websites website id session data properties
   * `GET /api/websites/{websiteId}/session-data/properties`
   */
  getSessionDataProperties(
    input: OperationInput<'getSessionDataProperties'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataProperties'>> {
    return this.execute('getSessionDataProperties', input, options);
  }

  /**
   * Get websites website id session data property series
   * `GET /api/websites/{websiteId}/session-data/property-series`
   */
  getSessionDataPropertySeries(
    input: OperationInput<'getSessionDataPropertySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataPropertySeries'>> {
    return this.execute('getSessionDataPropertySeries', input, options);
  }

  /**
   * Get websites website id session data stats
   * `GET /api/websites/{websiteId}/session-data/stats`
   */
  getSessionDataStats(
    input: OperationInput<'getSessionDataStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataStats'>> {
    return this.execute('getSessionDataStats', input, options);
  }

  /**
   * Get websites website id session data values
   * `GET /api/websites/{websiteId}/session-data/values`
   */
  getSessionDataValues(
    input: OperationInput<'getSessionDataValues'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataValues'>> {
    return this.execute('getSessionDataValues', input, options);
  }

  /**
   * Get share id share id
   * `GET /api/share/id/{shareId}`
   */
  getShare(
    input: OperationInput<'getShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getShare'>> {
    return this.execute('getShare', input, options);
  }

  /**
   * Get share slug
   * `GET /api/share/{slug}`
   */
  getShareBySlug(
    input: OperationInput<'getShareBySlug'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getShareBySlug'>> {
    return this.execute('getShareBySlug', input, options);
  }

  /**
   * Get auth subscription
   * `GET /api/auth/subscription`
   */
  getSubscription(
    input?: OperationInput<'getSubscription'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSubscription'>> {
    return this.execute('getSubscription', input, options);
  }

  /**
   * Get teams team id
   * `GET /api/teams/{teamId}`
   */
  getTeam(
    input: OperationInput<'getTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeam'>> {
    return this.execute('getTeam', input, options);
  }

  /**
   * Get teams team id boards
   * `GET /api/teams/{teamId}/boards`
   */
  getTeamBoards(
    input: OperationInput<'getTeamBoards'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamBoards'>> {
    return this.execute('getTeamBoards', input, options);
  }

  /**
   * Get teams team id links
   * `GET /api/teams/{teamId}/links`
   */
  getTeamLinks(
    input: OperationInput<'getTeamLinks'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamLinks'>> {
    return this.execute('getTeamLinks', input, options);
  }

  /**
   * Get teams team id pixels
   * `GET /api/teams/{teamId}/pixels`
   */
  getTeamPixels(
    input: OperationInput<'getTeamPixels'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamPixels'>> {
    return this.execute('getTeamPixels', input, options);
  }

  /**
   * Get teams
   * `GET /api/teams`
   */
  getTeams(
    input?: OperationInput<'getTeams'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeams'>> {
    return this.execute('getTeams', input, options);
  }

  /**
   * Get teams team id users user id
   * `GET /api/teams/{teamId}/users/{userId}`
   */
  getTeamUser(
    input: OperationInput<'getTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamUser'>> {
    return this.execute('getTeamUser', input, options);
  }

  /**
   * Get teams team id users
   * `GET /api/teams/{teamId}/users`
   */
  getTeamUsers(
    input: OperationInput<'getTeamUsers'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamUsers'>> {
    return this.execute('getTeamUsers', input, options);
  }

  /**
   * Get teams team id websites
   * `GET /api/teams/{teamId}/websites`
   */
  getTeamWebsites(
    input: OperationInput<'getTeamWebsites'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamWebsites'>> {
    return this.execute('getTeamWebsites', input, options);
  }

  /**
   * Get 2fa status
   * `GET /api/2fa/status`
   */
  getTwoFactorStatus(
    input?: OperationInput<'getTwoFactorStatus'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTwoFactorStatus'>> {
    return this.execute('getTwoFactorStatus', input, options);
  }

  /**
   * Get users user id
   * `GET /api/users/{userId}`
   */
  getUser(
    input: OperationInput<'getUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getUser'>> {
    return this.execute('getUser', input, options);
  }

  /**
   * Get users user id teams
   * `GET /api/users/{userId}/teams`
   */
  getUserTeams(
    input: OperationInput<'getUserTeams'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getUserTeams'>> {
    return this.execute('getUserTeams', input, options);
  }

  /**
   * Get users user id websites
   * `GET /api/users/{userId}/websites`
   */
  getUserWebsites(
    input: OperationInput<'getUserWebsites'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getUserWebsites'>> {
    return this.execute('getUserWebsites', input, options);
  }

  /**
   * Get a website
   * `GET /api/websites/{websiteId}`
   * OAuth scope: `websites:read`
   */
  getWebsite(
    input: OperationInput<'getWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsite'>> {
    return this.execute('getWebsite', input, options);
  }

  /**
   * Get current active visitors
   * Returns the number of visitors active on the website in the last few minutes.
   * `GET /api/websites/{websiteId}/active`
   * OAuth scope: `analytics:read`
   */
  getWebsiteActive(
    input: OperationInput<'getWebsiteActive'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteActive'>> {
    return this.execute('getWebsiteActive', input, options);
  }

  /**
   * Get websites website id annotations annotation id
   * `GET /api/websites/{websiteId}/annotations/{annotationId}`
   */
  getWebsiteAnnotation(
    input: OperationInput<'getWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteAnnotation'>> {
    return this.execute('getWebsiteAnnotation', input, options);
  }

  /**
   * Get websites website id annotations
   * `GET /api/websites/{websiteId}/annotations`
   */
  getWebsiteAnnotations(
    input: OperationInput<'getWebsiteAnnotations'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteAnnotations'>> {
    return this.execute('getWebsiteAnnotations', input, options);
  }

  /**
   * Get websites website id daterange
   * `GET /api/websites/{websiteId}/daterange`
   * OAuth scope: `analytics:read`
   */
  getWebsiteDateRange(
    input: OperationInput<'getWebsiteDateRange'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteDateRange'>> {
    return this.execute('getWebsiteDateRange', input, options);
  }

  /**
   * List tracked events
   * Returns a page of pageviews and custom events in the date range, newest first. Filter with `event` for a specific event name or `search` for free text.
   * `GET /api/websites/{websiteId}/events`
   * OAuth scope: `analytics:read`
   */
  getWebsiteEvents(
    input: OperationInput<'getWebsiteEvents'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteEvents'>> {
    return this.execute('getWebsiteEvents', input, options);
  }

  /**
   * Get websites website id events series
   * `GET /api/websites/{websiteId}/events/series`
   * OAuth scope: `analytics:read`
   */
  getWebsiteEventSeries(
    input: OperationInput<'getWebsiteEventSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteEventSeries'>> {
    return this.execute('getWebsiteEventSeries', input, options);
  }

  /**
   * Get websites website id events stats
   * `GET /api/websites/{websiteId}/events/stats`
   * OAuth scope: `analytics:read`
   */
  getWebsiteEventStats(
    input: OperationInput<'getWebsiteEventStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteEventStats'>> {
    return this.execute('getWebsiteEventStats', input, options);
  }

  /**
   * Get websites website id metrics expanded
   * `GET /api/websites/{websiteId}/metrics/expanded`
   * OAuth scope: `analytics:read`
   */
  getWebsiteExpandedMetrics(
    input: OperationInput<'getWebsiteExpandedMetrics'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteExpandedMetrics'>> {
    return this.execute('getWebsiteExpandedMetrics', input, options);
  }

  /**
   * Get ranked metrics for a dimension
   * Returns the top values for one dimension (`type`), such as pages, referrers, countries, browsers, UTM parameters or events, ordered by count. Page-type dimensions count views/events; visitor dimensions count unique visitors.
   * `GET /api/websites/{websiteId}/metrics`
   * OAuth scope: `analytics:read`
   */
  getWebsiteMetrics(
    input: OperationInput<'getWebsiteMetrics'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteMetrics'>> {
    return this.execute('getWebsiteMetrics', input, options);
  }

  /**
   * Get pageview and session time series
   * Returns pageviews and sessions bucketed by `unit` (minute, hour, day, month, year) in the given `timezone`. When `compare` is set the comparison period is included.
   * `GET /api/websites/{websiteId}/pageviews`
   * OAuth scope: `analytics:read`
   */
  getWebsitePageviews(
    input: OperationInput<'getWebsitePageviews'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsitePageviews'>> {
    return this.execute('getWebsitePageviews', input, options);
  }

  /**
   * Get websites website id recorder
   * `GET /api/websites/{websiteId}/recorder`
   */
  getWebsiteRecorderConfig(
    input: OperationInput<'getWebsiteRecorderConfig'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRecorderConfig'>> {
    return this.execute('getWebsiteRecorderConfig', input, options);
  }

  /**
   * Get websites website id replays replay id
   * `GET /api/websites/{websiteId}/replays/{replayId}`
   */
  getWebsiteReplay(
    input: OperationInput<'getWebsiteReplay'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReplay'>> {
    return this.execute('getWebsiteReplay', input, options);
  }

  /**
   * Get websites website id replays
   * `GET /api/websites/{websiteId}/replays`
   */
  getWebsiteReplays(
    input: OperationInput<'getWebsiteReplays'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReplays'>> {
    return this.execute('getWebsiteReplays', input, options);
  }

  /**
   * Get websites website id replays saved replay id
   * `GET /api/websites/{websiteId}/replays/saved/{replayId}`
   */
  getWebsiteReplaySaved(
    input: OperationInput<'getWebsiteReplaySaved'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReplaySaved'>> {
    return this.execute('getWebsiteReplaySaved', input, options);
  }

  /**
   * Get websites website id reports
   * `GET /api/websites/{websiteId}/reports`
   */
  getWebsiteReports(
    input: OperationInput<'getWebsiteReports'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReports'>> {
    return this.execute('getWebsiteReports', input, options);
  }

  /**
   * Get websites website id revenue chart
   * `GET /api/websites/{websiteId}/revenue/chart`
   */
  getWebsiteRevenueChart(
    input: OperationInput<'getWebsiteRevenueChart'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueChart'>> {
    return this.execute('getWebsiteRevenueChart', input, options);
  }

  /**
   * Get websites website id revenue metrics
   * `GET /api/websites/{websiteId}/revenue/metrics`
   */
  getWebsiteRevenueMetrics(
    input: OperationInput<'getWebsiteRevenueMetrics'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueMetrics'>> {
    return this.execute('getWebsiteRevenueMetrics', input, options);
  }

  /**
   * Get websites website id revenue sessions
   * `GET /api/websites/{websiteId}/revenue/sessions`
   */
  getWebsiteRevenueSessions(
    input: OperationInput<'getWebsiteRevenueSessions'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueSessions'>> {
    return this.execute('getWebsiteRevenueSessions', input, options);
  }

  /**
   * Get websites website id revenue stats
   * `GET /api/websites/{websiteId}/revenue/stats`
   */
  getWebsiteRevenueStats(
    input: OperationInput<'getWebsiteRevenueStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueStats'>> {
    return this.execute('getWebsiteRevenueStats', input, options);
  }

  /**
   * Get websites website id replays saved
   * `GET /api/websites/{websiteId}/replays/saved`
   */
  getWebsiteSavedReplays(
    input: OperationInput<'getWebsiteSavedReplays'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSavedReplays'>> {
    return this.execute('getWebsiteSavedReplays', input, options);
  }

  /**
   * Get websites charts
   * `GET /api/websites/charts`
   */
  getWebsitesCharts(
    input: OperationInput<'getWebsitesCharts'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsitesCharts'>> {
    return this.execute('getWebsitesCharts', input, options);
  }

  /**
   * Get websites website id segments segment id
   * `GET /api/websites/{websiteId}/segments/{segmentId}`
   */
  getWebsiteSegment(
    input: OperationInput<'getWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSegment'>> {
    return this.execute('getWebsiteSegment', input, options);
  }

  /**
   * Get websites website id segments
   * `GET /api/websites/{websiteId}/segments`
   */
  getWebsiteSegments(
    input: OperationInput<'getWebsiteSegments'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSegments'>> {
    return this.execute('getWebsiteSegments', input, options);
  }

  /**
   * Get websites website id sessions session id
   * `GET /api/websites/{websiteId}/sessions/{sessionId}`
   * OAuth scope: `analytics:read`
   */
  getWebsiteSession(
    input: OperationInput<'getWebsiteSession'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSession'>> {
    return this.execute('getWebsiteSession', input, options);
  }

  /**
   * Get websites website id sessions session id activity
   * `GET /api/websites/{websiteId}/sessions/{sessionId}/activity`
   * OAuth scope: `analytics:read`
   */
  getWebsiteSessionActivity(
    input: OperationInput<'getWebsiteSessionActivity'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessionActivity'>> {
    return this.execute('getWebsiteSessionActivity', input, options);
  }

  /**
   * Get websites website id sessions session id properties
   * `GET /api/websites/{websiteId}/sessions/{sessionId}/properties`
   * OAuth scope: `analytics:read`
   */
  getWebsiteSessionProperties(
    input: OperationInput<'getWebsiteSessionProperties'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessionProperties'>> {
    return this.execute('getWebsiteSessionProperties', input, options);
  }

  /**
   * Get websites website id sessions session id replays
   * `GET /api/websites/{websiteId}/sessions/{sessionId}/replays`
   */
  getWebsiteSessionReplays(
    input: OperationInput<'getWebsiteSessionReplays'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessionReplays'>> {
    return this.execute('getWebsiteSessionReplays', input, options);
  }

  /**
   * List visitor sessions
   * Returns a page of visitor sessions in the date range, newest first. `search` matches distinct ID, city, browser, OS or device.
   * `GET /api/websites/{websiteId}/sessions`
   * OAuth scope: `analytics:read`
   */
  getWebsiteSessions(
    input: OperationInput<'getWebsiteSessions'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessions'>> {
    return this.execute('getWebsiteSessions', input, options);
  }

  /**
   * Get websites website id sessions stats
   * `GET /api/websites/{websiteId}/sessions/stats`
   * OAuth scope: `analytics:read`
   */
  getWebsiteSessionStats(
    input: OperationInput<'getWebsiteSessionStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessionStats'>> {
    return this.execute('getWebsiteSessionStats', input, options);
  }

  /**
   * Get websites website id sessions weekly
   * `GET /api/websites/{websiteId}/sessions/weekly`
   */
  getWebsiteSessionsWeekly(
    input: OperationInput<'getWebsiteSessionsWeekly'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessionsWeekly'>> {
    return this.execute('getWebsiteSessionsWeekly', input, options);
  }

  /**
   * Get websites website id shares
   * `GET /api/websites/{websiteId}/shares`
   */
  getWebsiteShares(
    input: OperationInput<'getWebsiteShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteShares'>> {
    return this.execute('getWebsiteShares', input, options);
  }

  /**
   * Get website summary stats
   * Returns pageviews, unique visitors, visits, bounces and total time on site for the date range, plus the same totals for the comparison period (`compare`: prev or yoy).
   * `GET /api/websites/{websiteId}/stats`
   * OAuth scope: `analytics:read`
   */
  getWebsiteStats(
    input: OperationInput<'getWebsiteStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteStats'>> {
    return this.execute('getWebsiteStats', input, options);
  }

  /**
   * Get websites website id values
   * `GET /api/websites/{websiteId}/values`
   */
  getWebsiteValues(
    input: OperationInput<'getWebsiteValues'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteValues'>> {
    return this.execute('getWebsiteValues', input, options);
  }

  /**
   * Create or update 2fa setup initiate
   * `POST /api/2fa/setup/initiate`
   */
  initiateTwoFactorSetup(
    input?: OperationInput<'initiateTwoFactorSetup'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'initiateTwoFactorSetup'>> {
    return this.execute('initiateTwoFactorSetup', input, options);
  }

  /**
   * Create or update teams join
   * `POST /api/teams/join`
   */
  joinTeam(
    input: OperationInput<'joinTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'joinTeam'>> {
    return this.execute('joinTeam', input, options);
  }

  /**
   * List websites
   * Returns websites owned by the authenticated user.
   * `GET /api/websites`
   * OAuth scope: `websites:read`
   */
  listWebsites(
    input?: OperationInput<'listWebsites'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'listWebsites'>> {
    return this.execute('listWebsites', input, options);
  }

  /**
   * Log in
   * Authenticates a self-hosted Umami user. Users with two-factor authentication receive a short-lived partial token instead of a full bearer token.
   * `POST /api/auth/login`
   */
  login(
    input: OperationInput<'login'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'login'>> {
    return this.execute('login', input, options);
  }

  /**
   * Create or update auth logout
   * `POST /api/auth/logout`
   */
  logout(
    input?: OperationInput<'logout'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'logout'>> {
    return this.execute('logout', input, options);
  }

  /**
   * Create or update record
   * `POST /api/record`
   */
  record(
    input: OperationInput<'record'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'record'>> {
    return this.execute('record', input, options);
  }

  /**
   * Create or update websites website id reset
   * `POST /api/websites/{websiteId}/reset`
   */
  resetWebsite(
    input: OperationInput<'resetWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'resetWebsite'>> {
    return this.execute('resetWebsite', input, options);
  }

  /**
   * Create or update reports attribution
   * `POST /api/reports/attribution`
   * OAuth scope: `analytics:read`
   */
  runAttributionReport(
    input: OperationInput<'runAttributionReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runAttributionReport'>> {
    return this.execute('runAttributionReport', input, options);
  }

  /**
   * Create or update reports breakdown
   * `POST /api/reports/breakdown`
   * OAuth scope: `analytics:read`
   */
  runBreakdownReport(
    input: OperationInput<'runBreakdownReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runBreakdownReport'>> {
    return this.execute('runBreakdownReport', input, options);
  }

  /**
   * Create or update reports funnel
   * `POST /api/reports/funnel`
   * OAuth scope: `analytics:read`
   */
  runFunnelReport(
    input: OperationInput<'runFunnelReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runFunnelReport'>> {
    return this.execute('runFunnelReport', input, options);
  }

  /**
   * Create or update reports goal
   * `POST /api/reports/goal`
   */
  runGoalReport(
    input: OperationInput<'runGoalReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runGoalReport'>> {
    return this.execute('runGoalReport', input, options);
  }

  /**
   * Create or update reports heatmap
   * `POST /api/reports/heatmap`
   */
  runHeatmapReport(
    input: OperationInput<'runHeatmapReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runHeatmapReport'>> {
    return this.execute('runHeatmapReport', input, options);
  }

  /**
   * Create or update reports journey
   * `POST /api/reports/journey`
   * OAuth scope: `analytics:read`
   */
  runJourneyReport(
    input: OperationInput<'runJourneyReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runJourneyReport'>> {
    return this.execute('runJourneyReport', input, options);
  }

  /**
   * Create or update reports performance
   * `POST /api/reports/performance`
   */
  runPerformanceReport(
    input: OperationInput<'runPerformanceReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runPerformanceReport'>> {
    return this.execute('runPerformanceReport', input, options);
  }

  /**
   * Create or update reports retention
   * `POST /api/reports/retention`
   * OAuth scope: `analytics:read`
   */
  runRetentionReport(
    input: OperationInput<'runRetentionReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runRetentionReport'>> {
    return this.execute('runRetentionReport', input, options);
  }

  /**
   * Create or update reports revenue
   * `POST /api/reports/revenue`
   * OAuth scope: `analytics:read`
   */
  runRevenueReport(
    input: OperationInput<'runRevenueReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runRevenueReport'>> {
    return this.execute('runRevenueReport', input, options);
  }

  /**
   * Create or update reports utm
   * `POST /api/reports/utm`
   * OAuth scope: `analytics:read`
   */
  runUtmReport(
    input: OperationInput<'runUtmReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runUtmReport'>> {
    return this.execute('runUtmReport', input, options);
  }

  /**
   * Create or update websites website id replays saved replay id
   * `POST /api/websites/{websiteId}/replays/saved/{replayId}`
   */
  saveWebsiteReplay(
    input: OperationInput<'saveWebsiteReplay'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'saveWebsiteReplay'>> {
    return this.execute('saveWebsiteReplay', input, options);
  }

  /**
   * Create or update send
   * `POST /api/send`
   */
  send(input: OperationInput<'send'>, options?: RequestOptions): Promise<OperationOutput<'send'>> {
    return this.execute('send', input, options);
  }

  /**
   * Create or update auth sso
   * `POST /api/auth/sso`
   */
  sso(input?: OperationInput<'sso'>, options?: RequestOptions): Promise<OperationOutput<'sso'>> {
    return this.execute('sso', input, options);
  }

  /**
   * Create or update websites website id transfer
   * `POST /api/websites/{websiteId}/transfer`
   */
  transferWebsite(
    input: OperationInput<'transferWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'transferWebsite'>> {
    return this.execute('transferWebsite', input, options);
  }

  /**
   * Create or update boards board id
   * `POST /api/boards/{boardId}`
   */
  updateBoard(
    input: OperationInput<'updateBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateBoard'>> {
    return this.execute('updateBoard', input, options);
  }

  /**
   * Create or update links link id
   * `POST /api/links/{linkId}`
   */
  updateLink(
    input: OperationInput<'updateLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateLink'>> {
    return this.execute('updateLink', input, options);
  }

  /**
   * Create or update me password
   * `POST /api/me/password`
   */
  updateMyPassword(
    input: OperationInput<'updateMyPassword'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateMyPassword'>> {
    return this.execute('updateMyPassword', input, options);
  }

  /**
   * Create or update pixels pixel id
   * `POST /api/pixels/{pixelId}`
   */
  updatePixel(
    input: OperationInput<'updatePixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updatePixel'>> {
    return this.execute('updatePixel', input, options);
  }

  /**
   * Create or update reports report id
   * `POST /api/reports/{reportId}`
   */
  updateReport(
    input: OperationInput<'updateReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateReport'>> {
    return this.execute('updateReport', input, options);
  }

  /**
   * Create or update share id share id
   * `POST /api/share/id/{shareId}`
   */
  updateShare(
    input: OperationInput<'updateShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateShare'>> {
    return this.execute('updateShare', input, options);
  }

  /**
   * Create or update teams team id
   * `POST /api/teams/{teamId}`
   */
  updateTeam(
    input: OperationInput<'updateTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateTeam'>> {
    return this.execute('updateTeam', input, options);
  }

  /**
   * Create or update teams team id users user id
   * `POST /api/teams/{teamId}/users/{userId}`
   */
  updateTeamUser(
    input: OperationInput<'updateTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateTeamUser'>> {
    return this.execute('updateTeamUser', input, options);
  }

  /**
   * Create or update users user id
   * `POST /api/users/{userId}`
   */
  updateUser(
    input: OperationInput<'updateUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateUser'>> {
    return this.execute('updateUser', input, options);
  }

  /**
   * Update a website
   * `POST /api/websites/{websiteId}`
   */
  updateWebsite(
    input: OperationInput<'updateWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateWebsite'>> {
    return this.execute('updateWebsite', input, options);
  }

  /**
   * Create or update websites website id annotations annotation id
   * `POST /api/websites/{websiteId}/annotations/{annotationId}`
   */
  updateWebsiteAnnotation(
    input: OperationInput<'updateWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateWebsiteAnnotation'>> {
    return this.execute('updateWebsiteAnnotation', input, options);
  }

  /**
   * Create or update websites website id segments segment id
   * `POST /api/websites/{websiteId}/segments/{segmentId}`
   */
  updateWebsiteSegment(
    input: OperationInput<'updateWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateWebsiteSegment'>> {
    return this.execute('updateWebsiteSegment', input, options);
  }

  /**
   * Create or update auth verify
   * `POST /api/auth/verify`
   */
  verify(
    input?: OperationInput<'verify'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'verify'>> {
    return this.execute('verify', input, options);
  }

  /**
   * Create or update 2fa verify
   * `POST /api/2fa/verify`
   */
  verifyTwoFactor(
    input: OperationInput<'verifyTwoFactor'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'verifyTwoFactor'>> {
    return this.execute('verifyTwoFactor', input, options);
  }
}
