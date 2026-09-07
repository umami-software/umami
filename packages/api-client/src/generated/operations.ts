// GENERATED FILE. DO NOT EDIT.
// Source: public/openapi.json — regenerate with `pnpm generate:api`.

import type { RequestOptions } from '../types';
import type { components, operations as OperationTypes } from './types';

export const API_VERSION = '3.3.1';

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
   * Send a batch of tracking requests
   * Processes up to 500 tracking payloads and returns processed and failed counts, individual error details, and a tracking cache token.
   * `POST /api/batch`
   */
  batch(
    input: OperationInput<'batch'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'batch'>> {
    return this.execute('batch', input, options);
  }

  /**
   * Cancel two-factor authentication setup
   * Deletes the current user's pending setup without changing an already enabled authenticator.
   * `POST /api/2fa/setup/cancel`
   */
  cancelTwoFactorSetup(
    input?: OperationInput<'cancelTwoFactorSetup'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'cancelTwoFactorSetup'>> {
    return this.execute('cancelTwoFactorSetup', input, options);
  }

  /**
   * Clone a board
   * Creates a copy of a board with optional changes to its name, description, and configuration. Removes invalid report references from the copy.
   * `POST /api/boards/{boardId}/clone`
   */
  cloneBoard(
    input: OperationInput<'cloneBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'cloneBoard'>> {
    return this.execute('cloneBoard', input, options);
  }

  /**
   * Confirm two-factor authentication setup
   * Verifies an authenticator code, enables two-factor authentication, and returns a new set of backup codes.
   * `POST /api/2fa/setup/confirm`
   */
  confirmTwoFactorSetup(
    input: OperationInput<'confirmTwoFactorSetup'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'confirmTwoFactorSetup'>> {
    return this.execute('confirmTwoFactorSetup', input, options);
  }

  /**
   * Create a board
   * Creates a board with a name, type, and configuration, optionally assigned to a team. Validates access to its referenced resources and reports.
   * `POST /api/boards`
   */
  createBoard(
    input: OperationInput<'createBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createBoard'>> {
    return this.execute('createBoard', input, options);
  }

  /**
   * Create a share for a board
   * Creates a named share for the specified board with optional parameters.
   * `POST /api/boards/{boardId}/shares`
   */
  createBoardShare(
    input: OperationInput<'createBoardShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createBoardShare'>> {
    return this.execute('createBoardShare', input, options);
  }

  /**
   * Create a tracked link
   * Creates a tracked link with a name, destination URL, and slug, optionally assigned to a team.
   * `POST /api/links`
   */
  createLink(
    input: OperationInput<'createLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createLink'>> {
    return this.execute('createLink', input, options);
  }

  /**
   * Create a share for a link
   * Creates a named share for the specified link with optional parameters.
   * `POST /api/links/{linkId}/shares`
   */
  createLinkShare(
    input: OperationInput<'createLinkShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createLinkShare'>> {
    return this.execute('createLinkShare', input, options);
  }

  /**
   * Create an API key
   * Creates a named API key for the current user and returns its secret value. Available on self-hosted installations.
   * `POST /api/me/api-keys`
   */
  createMyApiKey(
    input: OperationInput<'createMyApiKey'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createMyApiKey'>> {
    return this.execute('createMyApiKey', input, options);
  }

  /**
   * Create a tracking pixel
   * Creates a tracking pixel with a name and slug, optionally assigned to a team.
   * `POST /api/pixels`
   */
  createPixel(
    input: OperationInput<'createPixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createPixel'>> {
    return this.execute('createPixel', input, options);
  }

  /**
   * Create a share for a tracking pixel
   * Creates a named share for the specified tracking pixel with optional parameters.
   * `POST /api/pixels/{pixelId}/shares`
   */
  createPixelShare(
    input: OperationInput<'createPixelShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createPixelShare'>> {
    return this.execute('createPixelShare', input, options);
  }

  /**
   * Save a report
   * Saves a report's name, description, type, and parameters for a website so it can be opened again later.
   * `POST /api/reports`
   */
  createReport(
    input: OperationInput<'createReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createReport'>> {
    return this.execute('createReport', input, options);
  }

  /**
   * Create a share
   * Creates a named share for a website, board, link, or pixel with parameters and an optional custom slug.
   * `POST /api/share`
   */
  createShare(
    input: OperationInput<'createShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createShare'>> {
    return this.execute('createShare', input, options);
  }

  /**
   * Create a team
   * Creates a team with an access code and an owner. Administrators can specify a different user as the owner.
   * `POST /api/teams`
   */
  createTeam(
    input: OperationInput<'createTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createTeam'>> {
    return this.execute('createTeam', input, options);
  }

  /**
   * Add a team member
   * Adds an existing user to the specified team with the supplied team role.
   * `POST /api/teams/{teamId}/users`
   */
  createTeamUser(
    input: OperationInput<'createTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createTeamUser'>> {
    return this.execute('createTeamUser', input, options);
  }

  /**
   * Create a user
   * Creates a user account with the supplied username, password, and role.
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
   * Creates a website with a name and domain, optionally assigning it to a team and creating a share.
   * `POST /api/websites`
   */
  createWebsite(
    input: OperationInput<'createWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsite'>> {
    return this.execute('createWebsite', input, options);
  }

  /**
   * Create a website annotation
   * Adds a dated note to the website, optionally marking it as an all-day annotation.
   * `POST /api/websites/{websiteId}/annotations`
   */
  createWebsiteAnnotation(
    input: OperationInput<'createWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsiteAnnotation'>> {
    return this.execute('createWebsiteAnnotation', input, options);
  }

  /**
   * Create a website segment or cohort
   * Saves a named segment or cohort with its type and filter parameters for the website.
   * `POST /api/websites/{websiteId}/segments`
   */
  createWebsiteSegment(
    input: OperationInput<'createWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsiteSegment'>> {
    return this.execute('createWebsiteSegment', input, options);
  }

  /**
   * Create a share for a website
   * Creates a named share for the specified website with optional parameters.
   * `POST /api/websites/{websiteId}/shares`
   */
  createWebsiteShare(
    input: OperationInput<'createWebsiteShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'createWebsiteShare'>> {
    return this.execute('createWebsiteShare', input, options);
  }

  /**
   * Delete a board
   * Deletes the specified board after checking the caller's permission to remove it.
   * `DELETE /api/boards/{boardId}`
   */
  deleteBoard(
    input: OperationInput<'deleteBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteBoard'>> {
    return this.execute('deleteBoard', input, options);
  }

  /**
   * Delete a tracked link
   * Deletes the specified tracked link after checking the caller's permission to remove it.
   * `DELETE /api/links/{linkId}`
   */
  deleteLink(
    input: OperationInput<'deleteLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteLink'>> {
    return this.execute('deleteLink', input, options);
  }

  /**
   * Delete an API key
   * Deletes an API key belonging to the current user, revoking its access. Available on self-hosted installations.
   * `DELETE /api/me/api-keys/{keyId}`
   */
  deleteMyApiKey(
    input: OperationInput<'deleteMyApiKey'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteMyApiKey'>> {
    return this.execute('deleteMyApiKey', input, options);
  }

  /**
   * Delete a tracking pixel
   * Deletes the specified tracking pixel after checking the caller's permission to remove it.
   * `DELETE /api/pixels/{pixelId}`
   */
  deletePixel(
    input: OperationInput<'deletePixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deletePixel'>> {
    return this.execute('deletePixel', input, options);
  }

  /**
   * Delete a saved report
   * Deletes the specified saved report definition.
   * `DELETE /api/reports/{reportId}`
   */
  deleteReport(
    input: OperationInput<'deleteReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteReport'>> {
    return this.execute('deleteReport', input, options);
  }

  /**
   * Delete a share
   * Deletes the specified share after checking permission to delete shares for its resource.
   * `DELETE /api/share/id/{shareId}`
   */
  deleteShare(
    input: OperationInput<'deleteShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteShare'>> {
    return this.execute('deleteShare', input, options);
  }

  /**
   * Delete a team
   * Deletes the specified team after checking the caller's permission to remove it.
   * `DELETE /api/teams/{teamId}`
   */
  deleteTeam(
    input: OperationInput<'deleteTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteTeam'>> {
    return this.execute('deleteTeam', input, options);
  }

  /**
   * Remove a team member
   * Removes a user's membership from the specified team, subject to team role and ownership restrictions.
   * `DELETE /api/teams/{teamId}/users/{userId}`
   */
  deleteTeamUser(
    input: OperationInput<'deleteTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteTeamUser'>> {
    return this.execute('deleteTeamUser', input, options);
  }

  /**
   * Delete a user
   * Deletes the specified user account. The current user cannot delete their own account through this operation.
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
   * Deletes the specified website after checking the caller's permission to remove it.
   * `DELETE /api/websites/{websiteId}`
   */
  deleteWebsite(
    input: OperationInput<'deleteWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsite'>> {
    return this.execute('deleteWebsite', input, options);
  }

  /**
   * Delete a website annotation
   * Deletes the specified dated note from the website.
   * `DELETE /api/websites/{websiteId}/annotations/{annotationId}`
   */
  deleteWebsiteAnnotation(
    input: OperationInput<'deleteWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsiteAnnotation'>> {
    return this.execute('deleteWebsiteAnnotation', input, options);
  }

  /**
   * Delete a website segment or cohort
   * Deletes the specified saved segment or cohort from the website.
   * `DELETE /api/websites/{websiteId}/segments/{segmentId}`
   */
  deleteWebsiteSegment(
    input: OperationInput<'deleteWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsiteSegment'>> {
    return this.execute('deleteWebsiteSegment', input, options);
  }

  /**
   * Delete a visitor session
   * Deletes the specified session and its associated analytics data. Available on installations using only a relational database.
   * `DELETE /api/websites/{websiteId}/sessions/{sessionId}`
   */
  deleteWebsiteSession(
    input: OperationInput<'deleteWebsiteSession'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'deleteWebsiteSession'>> {
    return this.execute('deleteWebsiteSession', input, options);
  }

  /**
   * Disable two-factor authentication
   * Disables two-factor authentication for the current user after verifying their password and authenticator code. Rejected when an administrator or team requires it.
   * `POST /api/2fa/disable`
   */
  disableTwoFactor(
    input: OperationInput<'disableTwoFactor'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'disableTwoFactor'>> {
    return this.execute('disableTwoFactor', input, options);
  }

  /**
   * Export website analytics
   * Returns a base64-encoded ZIP archive containing CSV exports of events, pages, referrers, browsers, operating systems, devices, and countries.
   * `GET /api/websites/{websiteId}/export`
   */
  exportWebsite(
    input: OperationInput<'exportWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'exportWebsite'>> {
    return this.execute('exportWebsite', input, options);
  }

  /**
   * Get a board
   * Returns the specified board and its configuration.
   * `GET /api/boards/{boardId}`
   */
  getBoard(
    input: OperationInput<'getBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getBoard'>> {
    return this.execute('getBoard', input, options);
  }

  /**
   * List my boards
   * Returns a paginated list of the current user's boards, with search and sorting options.
   * `GET /api/boards`
   */
  getBoards(
    input?: OperationInput<'getBoards'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getBoards'>> {
    return this.execute('getBoards', input, options);
  }

  /**
   * List shares for a board
   * Returns a paginated list of shares for the specified board.
   * `GET /api/boards/{boardId}/shares`
   */
  getBoardShares(
    input: OperationInput<'getBoardShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getBoardShares'>> {
    return this.execute('getBoardShares', input, options);
  }

  /**
   * List events with custom properties
   * Returns a page of events in the selected date range, grouping each event's custom property records together.
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
   * Get event array values over time
   * Counts individual values in an array property for the specified event, grouped by value and time interval.
   * `GET /api/websites/{websiteId}/event-data-pivot/array-series`
   */
  getEventDataArraySeries(
    input: OperationInput<'getEventDataArraySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataArraySeries'>> {
    return this.execute('getEventDataArraySeries', input, options);
  }

  /**
   * Get an event's custom properties
   * Returns the custom property records, data types, and values attached to a specific event.
   * `GET /api/websites/{websiteId}/event-data/{eventId}`
   */
  getEventDataById(
    input: OperationInput<'getEventDataById'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataById'>> {
    return this.execute('getEventDataById', input, options);
  }

  /**
   * Get the distribution of event date values
   * Counts occurrences of dates stored in the specified event property, grouping by the property's date value within the selected event date range.
   * `GET /api/websites/{websiteId}/event-data-pivot/date-series`
   */
  getEventDataDateSeries(
    input: OperationInput<'getEventDataDateSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataDateSeries'>> {
    return this.execute('getEventDataDateSeries', input, options);
  }

  /**
   * Summarize properties by event
   * Returns property names, types, and counts grouped by event name. When an event is specified, also groups by property value.
   * `GET /api/websites/{websiteId}/event-data/events`
   */
  getEventDataEvents(
    input: OperationInput<'getEventDataEvents'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataEvents'>> {
    return this.execute('getEventDataEvents', input, options);
  }

  /**
   * List event property fields
   * Returns property names, data types, and counts for the selected date range, optionally restricted to an event name.
   * `GET /api/websites/{websiteId}/event-data/fields`
   */
  getEventDataFields(
    input: OperationInput<'getEventDataFields'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataFields'>> {
    return this.execute('getEventDataFields', input, options);
  }

  /**
   * Get numeric event properties over time
   * Returns the sum, average, or count of a numeric property for the specified event, grouped by time interval.
   * `GET /api/websites/{websiteId}/event-data-pivot/numeric-series`
   */
  getEventDataNumericSeries(
    input: OperationInput<'getEventDataNumericSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataNumericSeries'>> {
    return this.execute('getEventDataNumericSeries', input, options);
  }

  /**
   * Get numeric event property statistics
   * Returns the total, average, median, minimum, and maximum of the specified numeric event property for the selected date range and filters.
   * `GET /api/websites/{websiteId}/event-data-pivot/numeric-stats`
   */
  getEventDataNumericStats(
    input: OperationInput<'getEventDataNumericStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataNumericStats'>> {
    return this.execute('getEventDataNumericStats', input, options);
  }

  /**
   * List event properties in table form
   * Returns a page of occurrences of the specified event, with event details and property keys and values grouped into one row per occurrence.
   * `GET /api/websites/{websiteId}/event-data-pivot`
   */
  getEventDataPivot(
    input: OperationInput<'getEventDataPivot'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataPivot'>> {
    return this.execute('getEventDataPivot', input, options);
  }

  /**
   * List event property usage
   * Returns event names and their custom property names, data types, and record counts for the selected date range and filters.
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
   * Get event property values over time
   * Counts occurrences of string values in the specified event property, grouped by value and time interval.
   * `GET /api/websites/{websiteId}/event-data-pivot/property-series`
   */
  getEventDataPropertySeries(
    input: OperationInput<'getEventDataPropertySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getEventDataPropertySeries'>> {
    return this.execute('getEventDataPropertySeries', input, options);
  }

  /**
   * Get event property totals
   * Returns counts of events with custom data, distinct property names, and property records for the selected date range and filters.
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
   * List event property values
   * Returns values and their occurrence counts for a custom event property, optionally restricted by event name and data type.
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
   * Get a tracked link
   * Returns the specified tracked link, including its destination URL and slug.
   * `GET /api/links/{linkId}`
   */
  getLink(
    input: OperationInput<'getLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLink'>> {
    return this.execute('getLink', input, options);
  }

  /**
   * List my links
   * Returns a paginated list of the current user's tracked links, with search and sorting options.
   * `GET /api/links`
   */
  getLinks(
    input?: OperationInput<'getLinks'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLinks'>> {
    return this.execute('getLinks', input, options);
  }

  /**
   * Get visitor charts for links
   * Returns visitor totals and chart data for the requested links the caller can view, within the selected date range.
   * `GET /api/links/charts`
   */
  getLinksCharts(
    input: OperationInput<'getLinksCharts'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLinksCharts'>> {
    return this.execute('getLinksCharts', input, options);
  }

  /**
   * List shares for a link
   * Returns a paginated list of shares for the specified link.
   * `GET /api/links/{linkId}/shares`
   */
  getLinkShares(
    input: OperationInput<'getLinkShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getLinkShares'>> {
    return this.execute('getLinkShares', input, options);
  }

  /**
   * Get my authentication details
   * Returns the current authentication context, including the authenticated user or share credentials.
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
   * List my API keys
   * Returns metadata for the current user's API keys. Available on self-hosted installations.
   * `GET /api/me/api-keys`
   */
  getMyApiKeys(
    input?: OperationInput<'getMyApiKeys'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMyApiKeys'>> {
    return this.execute('getMyApiKeys', input, options);
  }

  /**
   * List my team memberships
   * Returns a paginated list of teams the current user belongs to, with sorting options.
   * `GET /api/me/teams`
   */
  getMyTeams(
    input?: OperationInput<'getMyTeams'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMyTeams'>> {
    return this.execute('getMyTeams', input, options);
  }

  /**
   * List my websites
   * Returns a paginated list of the current user's websites, optionally including websites accessible through team membership.
   * `GET /api/me/websites`
   */
  getMyWebsites(
    input?: OperationInput<'getMyWebsites'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getMyWebsites'>> {
    return this.execute('getMyWebsites', input, options);
  }

  /**
   * Get a tracking pixel
   * Returns the specified tracking pixel and its configuration.
   * `GET /api/pixels/{pixelId}`
   */
  getPixel(
    input: OperationInput<'getPixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixel'>> {
    return this.execute('getPixel', input, options);
  }

  /**
   * List my tracking pixels
   * Returns a paginated list of the current user's tracking pixels, with search and sorting options.
   * `GET /api/pixels`
   */
  getPixels(
    input?: OperationInput<'getPixels'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixels'>> {
    return this.execute('getPixels', input, options);
  }

  /**
   * Get visitor charts for tracking pixels
   * Returns visitor totals and chart data for the requested pixels the caller can view, within the selected date range.
   * `GET /api/pixels/charts`
   */
  getPixelsCharts(
    input: OperationInput<'getPixelsCharts'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixelsCharts'>> {
    return this.execute('getPixelsCharts', input, options);
  }

  /**
   * List shares for a tracking pixel
   * Returns a paginated list of shares for the specified tracking pixel.
   * `GET /api/pixels/{pixelId}/shares`
   */
  getPixelShares(
    input: OperationInput<'getPixelShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getPixelShares'>> {
    return this.execute('getPixelShares', input, options);
  }

  /**
   * Get real-time website activity
   * Returns recent website activity and visitor data for the real-time view, applying the supplied filters.
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
   * Get a saved report
   * Returns the specified report's saved name, description, type, and parameters.
   * `GET /api/reports/{reportId}`
   */
  getReport(
    input: OperationInput<'getReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getReport'>> {
    return this.execute('getReport', input, options);
  }

  /**
   * List saved reports
   * Returns a paginated list of saved reports for the requested website, optionally filtered by report type.
   * `GET /api/reports`
   */
  getReports(
    input: OperationInput<'getReports'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getReports'>> {
    return this.execute('getReports', input, options);
  }

  /**
   * Get session array values over time
   * Counts distinct sessions for individual values in an array property, grouped by value and time interval.
   * `GET /api/websites/{websiteId}/session-data/array-series`
   */
  getSessionDataArraySeries(
    input: OperationInput<'getSessionDataArraySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataArraySeries'>> {
    return this.execute('getSessionDataArraySeries', input, options);
  }

  /**
   * Get the distribution of session date values
   * Counts distinct sessions by dates stored in the specified custom property, using the selected date range and filters.
   * `GET /api/websites/{websiteId}/session-data/date-series`
   */
  getSessionDataDateSeries(
    input: OperationInput<'getSessionDataDateSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataDateSeries'>> {
    return this.execute('getSessionDataDateSeries', input, options);
  }

  /**
   * Get numeric session properties over time
   * Returns the sum, average, or count of a numeric session property, grouped by time interval for the selected date range and filters.
   * `GET /api/websites/{websiteId}/session-data/numeric-series`
   */
  getSessionDataNumericSeries(
    input: OperationInput<'getSessionDataNumericSeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataNumericSeries'>> {
    return this.execute('getSessionDataNumericSeries', input, options);
  }

  /**
   * Get numeric session property statistics
   * Returns the total, average, median, minimum, and maximum of the specified numeric session property for the selected date range and filters.
   * `GET /api/websites/{websiteId}/session-data/numeric-stats`
   */
  getSessionDataNumericStats(
    input: OperationInput<'getSessionDataNumericStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataNumericStats'>> {
    return this.execute('getSessionDataNumericStats', input, options);
  }

  /**
   * List session properties in table form
   * Returns a page of sessions matching the selected property and filters, with the latest property keys and values grouped into one row per session.
   * `GET /api/websites/{websiteId}/session-data-pivot`
   */
  getSessionDataPivot(
    input: OperationInput<'getSessionDataPivot'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataPivot'>> {
    return this.execute('getSessionDataPivot', input, options);
  }

  /**
   * List session property usage
   * Returns custom session property names, data types, and distinct session counts, optionally restricted to sessions with a selected property.
   * `GET /api/websites/{websiteId}/session-data/properties`
   */
  getSessionDataProperties(
    input: OperationInput<'getSessionDataProperties'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataProperties'>> {
    return this.execute('getSessionDataProperties', input, options);
  }

  /**
   * Get session property values over time
   * Counts distinct sessions for string values in a custom property, grouped by value and time interval.
   * `GET /api/websites/{websiteId}/session-data/property-series`
   */
  getSessionDataPropertySeries(
    input: OperationInput<'getSessionDataPropertySeries'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataPropertySeries'>> {
    return this.execute('getSessionDataPropertySeries', input, options);
  }

  /**
   * Get activity by session property
   * Returns session, visit, pageview, event, and total activity counts grouped by values of the specified session property.
   * `GET /api/websites/{websiteId}/session-data/stats`
   */
  getSessionDataStats(
    input: OperationInput<'getSessionDataStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataStats'>> {
    return this.execute('getSessionDataStats', input, options);
  }

  /**
   * List session property values
   * Returns custom session property values and their occurrence counts, optionally filtered by property name and data type.
   * `GET /api/websites/{websiteId}/session-data/values`
   */
  getSessionDataValues(
    input: OperationInput<'getSessionDataValues'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSessionDataValues'>> {
    return this.execute('getSessionDataValues', input, options);
  }

  /**
   * Get a share
   * Returns a share's configuration by its ID after checking access to the shared resource.
   * `GET /api/share/id/{shareId}`
   */
  getShare(
    input: OperationInput<'getShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getShare'>> {
    return this.execute('getShare', input, options);
  }

  /**
   * Open a share by its slug
   * Resolves a public share slug and returns its resource references, parameters, and an access token scoped to the shared resources.
   * `GET /api/share/{slug}`
   */
  getShareBySlug(
    input: OperationInput<'getShareBySlug'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getShareBySlug'>> {
    return this.execute('getShareBySlug', input, options);
  }

  /**
   * Get subscription details
   * Returns subscription and feature availability for the current user or a specified team the user can access.
   * `GET /api/auth/subscription`
   */
  getSubscription(
    input?: OperationInput<'getSubscription'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getSubscription'>> {
    return this.execute('getSubscription', input, options);
  }

  /**
   * Get a team
   * Returns the specified team's details, including its members.
   * `GET /api/teams/{teamId}`
   */
  getTeam(
    input: OperationInput<'getTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeam'>> {
    return this.execute('getTeam', input, options);
  }

  /**
   * List a team's boards
   * Returns a paginated list of boards belonging to the specified team, with search and sorting options.
   * `GET /api/teams/{teamId}/boards`
   */
  getTeamBoards(
    input: OperationInput<'getTeamBoards'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamBoards'>> {
    return this.execute('getTeamBoards', input, options);
  }

  /**
   * List a team's links
   * Returns a paginated list of tracked links belonging to the specified team, with search and sorting options.
   * `GET /api/teams/{teamId}/links`
   */
  getTeamLinks(
    input: OperationInput<'getTeamLinks'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamLinks'>> {
    return this.execute('getTeamLinks', input, options);
  }

  /**
   * List a team's tracking pixels
   * Returns a paginated list of tracking pixels belonging to the specified team, with search and sorting options.
   * `GET /api/teams/{teamId}/pixels`
   */
  getTeamPixels(
    input: OperationInput<'getTeamPixels'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamPixels'>> {
    return this.execute('getTeamPixels', input, options);
  }

  /**
   * List my teams
   * Returns a paginated list of teams the current user belongs to, with sorting options.
   * `GET /api/teams`
   */
  getTeams(
    input?: OperationInput<'getTeams'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeams'>> {
    return this.execute('getTeams', input, options);
  }

  /**
   * Get a team member
   * Returns the specified user's membership details for a team.
   * `GET /api/teams/{teamId}/users/{userId}`
   */
  getTeamUser(
    input: OperationInput<'getTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamUser'>> {
    return this.execute('getTeamUser', input, options);
  }

  /**
   * List team members
   * Returns a paginated list of members of the specified team, including usernames and membership details.
   * `GET /api/teams/{teamId}/users`
   */
  getTeamUsers(
    input: OperationInput<'getTeamUsers'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamUsers'>> {
    return this.execute('getTeamUsers', input, options);
  }

  /**
   * List a team's websites
   * Returns a paginated list of websites belonging to the specified team, with search and sorting options.
   * `GET /api/teams/{teamId}/websites`
   */
  getTeamWebsites(
    input: OperationInput<'getTeamWebsites'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTeamWebsites'>> {
    return this.execute('getTeamWebsites', input, options);
  }

  /**
   * Get two-factor authentication status
   * Returns whether two-factor authentication is enabled, configured, or required for the current user, including the reason it is required.
   * `GET /api/2fa/status`
   */
  getTwoFactorStatus(
    input?: OperationInput<'getTwoFactorStatus'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getTwoFactorStatus'>> {
    return this.execute('getTwoFactorStatus', input, options);
  }

  /**
   * Get a user
   * Returns details for the specified user account when the caller has permission to view it.
   * `GET /api/users/{userId}`
   */
  getUser(
    input: OperationInput<'getUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getUser'>> {
    return this.execute('getUser', input, options);
  }

  /**
   * List a user's teams
   * Returns a paginated list of teams for the specified user. Available to that user and administrators.
   * `GET /api/users/{userId}/teams`
   */
  getUserTeams(
    input: OperationInput<'getUserTeams'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getUserTeams'>> {
    return this.execute('getUserTeams', input, options);
  }

  /**
   * List a user's websites
   * Returns a paginated list of the specified user's websites, optionally including team access. Available to that user and administrators.
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
   * Returns the specified website's details and configuration.
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
   * Get active website visitors
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
   * Get a website annotation
   * Returns the date, all-day setting, and note for a specific website annotation.
   * `GET /api/websites/{websiteId}/annotations/{annotationId}`
   */
  getWebsiteAnnotation(
    input: OperationInput<'getWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteAnnotation'>> {
    return this.execute('getWebsiteAnnotation', input, options);
  }

  /**
   * List website annotations
   * Returns a paginated list of dated notes for the website, optionally filtered by date range or search text.
   * `GET /api/websites/{websiteId}/annotations`
   */
  getWebsiteAnnotations(
    input: OperationInput<'getWebsiteAnnotations'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteAnnotations'>> {
    return this.execute('getWebsiteAnnotations', input, options);
  }

  /**
   * Get the website's available date range
   * Returns the earliest and latest recorded event dates for the website.
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
   * Returns a page of pageviews and custom events in the date range, newest first. Supports filtering by event name and searching event details.
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
   * Get custom event counts over time
   * Returns counts grouped by event name and time interval, optionally limited to the most frequent event names.
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
   * Get website event statistics
   * Returns website event totals for the selected date range and filters, including totals for the comparison period.
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
   * Get detailed website metrics
   * Returns additional analytics for the selected page, event, visitor, or channel dimension, using the supplied date range and filters.
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
   * Get ranked website metrics
   * Returns the most frequent values for a dimension such as pages, referrers, countries, browsers, campaigns, or events. Counts pageviews or events for activity dimensions and unique visitors for visitor dimensions.
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
   * Get pageviews and sessions over time
   * Returns pageviews and sessions grouped by the requested time interval and timezone, including a comparison period when requested.
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
   * Get website recording settings
   * Returns public replay and heatmap settings, including sampling, masking, and duration limits. Returns disabled status when recording is unavailable.
   * `GET /api/websites/{websiteId}/recorder`
   */
  getWebsiteRecorderConfig(
    input: OperationInput<'getWebsiteRecorderConfig'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRecorderConfig'>> {
    return this.execute('getWebsiteRecorderConfig', input, options);
  }

  /**
   * Get a session replay recording
   * Returns the merged recording events, session details, and event and chunk counts for a replay, with optional stopping points by timestamp, chunk, or event index.
   * `GET /api/websites/{websiteId}/replays/{replayId}`
   */
  getWebsiteReplay(
    input: OperationInput<'getWebsiteReplay'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReplay'>> {
    return this.execute('getWebsiteReplay', input, options);
  }

  /**
   * List website session replays
   * Returns a paginated list of recorded sessions for the website, applying date, replay, and search filters.
   * `GET /api/websites/{websiteId}/replays`
   */
  getWebsiteReplays(
    input: OperationInput<'getWebsiteReplays'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReplays'>> {
    return this.execute('getWebsiteReplays', input, options);
  }

  /**
   * Check whether a replay is saved
   * Returns whether the specified replay is in the website's saved replays.
   * `GET /api/websites/{websiteId}/replays/saved/{replayId}`
   */
  getWebsiteReplaySaved(
    input: OperationInput<'getWebsiteReplaySaved'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReplaySaved'>> {
    return this.execute('getWebsiteReplaySaved', input, options);
  }

  /**
   * List a website's saved reports
   * Returns a paginated list of saved report definitions for the website, optionally filtered by report type.
   * `GET /api/websites/{websiteId}/reports`
   */
  getWebsiteReports(
    input: OperationInput<'getWebsiteReports'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteReports'>> {
    return this.execute('getWebsiteReports', input, options);
  }

  /**
   * Get website revenue over time
   * Returns revenue chart data for the selected currency, date range, and website filters.
   * `GET /api/websites/{websiteId}/revenue/chart`
   */
  getWebsiteRevenueChart(
    input: OperationInput<'getWebsiteRevenueChart'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueChart'>> {
    return this.execute('getWebsiteRevenueChart', input, options);
  }

  /**
   * Get website revenue by dimension
   * Returns revenue grouped by the requested dimension, such as country or referrer, for the selected currency and date range.
   * `GET /api/websites/{websiteId}/revenue/metrics`
   */
  getWebsiteRevenueMetrics(
    input: OperationInput<'getWebsiteRevenueMetrics'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueMetrics'>> {
    return this.execute('getWebsiteRevenueMetrics', input, options);
  }

  /**
   * List sessions with revenue
   * Returns a paginated list of sessions with revenue in the selected currency and date range, applying website and search filters.
   * `GET /api/websites/{websiteId}/revenue/sessions`
   */
  getWebsiteRevenueSessions(
    input: OperationInput<'getWebsiteRevenueSessions'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueSessions'>> {
    return this.execute('getWebsiteRevenueSessions', input, options);
  }

  /**
   * Get website revenue totals
   * Returns revenue summary statistics for the selected currency and date range, including totals for the comparison period.
   * `GET /api/websites/{websiteId}/revenue/stats`
   */
  getWebsiteRevenueStats(
    input: OperationInput<'getWebsiteRevenueStats'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteRevenueStats'>> {
    return this.execute('getWebsiteRevenueStats', input, options);
  }

  /**
   * List saved session replays
   * Returns a paginated, searchable list of replays saved for the website.
   * `GET /api/websites/{websiteId}/replays/saved`
   */
  getWebsiteSavedReplays(
    input: OperationInput<'getWebsiteSavedReplays'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSavedReplays'>> {
    return this.execute('getWebsiteSavedReplays', input, options);
  }

  /**
   * Get visitor charts for websites
   * Returns visitor totals and chart data for the requested websites the caller can view, within the selected date range.
   * `GET /api/websites/charts`
   */
  getWebsitesCharts(
    input: OperationInput<'getWebsitesCharts'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsitesCharts'>> {
    return this.execute('getWebsitesCharts', input, options);
  }

  /**
   * Get a website segment or cohort
   * Returns a saved segment or cohort and its filter parameters for the website.
   * `GET /api/websites/{websiteId}/segments/{segmentId}`
   */
  getWebsiteSegment(
    input: OperationInput<'getWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSegment'>> {
    return this.execute('getWebsiteSegment', input, options);
  }

  /**
   * List website segments and cohorts
   * Returns saved segments or cohorts for the website, filtered by the requested type and search text.
   * `GET /api/websites/{websiteId}/segments`
   */
  getWebsiteSegments(
    input: OperationInput<'getWebsiteSegments'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSegments'>> {
    return this.execute('getWebsiteSegments', input, options);
  }

  /**
   * Get a visitor session
   * Returns details for a website session, including linked visitor identities and whether session deletion is available to the caller.
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
   * Get a visitor's session activity
   * Returns activity for the specified session and sessions linked by visitor identity, using the requested date range and optional distinct ID.
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
   * Get a session's custom properties
   * Returns custom property records, data types, and values for the specified website session.
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
   * List a visitor's session replays
   * Returns a paginated, searchable list of recordings for the specified website session.
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
   * Returns a page of visitor sessions in the date range, newest first. Search matches distinct ID, city, browser, operating system, or device.
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
   * Get visitor session statistics
   * Returns aggregate session metrics for the website over the selected date range and filters.
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
   * Get traffic by weekday and hour
   * Returns distinct visitor counts grouped by day of the week and hour in the selected timezone and date range.
   * `GET /api/websites/{websiteId}/sessions/weekly`
   */
  getWebsiteSessionsWeekly(
    input: OperationInput<'getWebsiteSessionsWeekly'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteSessionsWeekly'>> {
    return this.execute('getWebsiteSessionsWeekly', input, options);
  }

  /**
   * List shares for a website
   * Returns a paginated list of shares for the specified website.
   * `GET /api/websites/{websiteId}/shares`
   */
  getWebsiteShares(
    input: OperationInput<'getWebsiteShares'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteShares'>> {
    return this.execute('getWebsiteShares', input, options);
  }

  /**
   * Get website summary statistics
   * Returns pageviews, unique visitors, visits, bounces, and total time on site for the selected date range and comparison period.
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
   * List website filter values
   * Returns available values for a website filter, including saved segments or cohorts when requested, to populate filter choices.
   * `GET /api/websites/{websiteId}/values`
   */
  getWebsiteValues(
    input: OperationInput<'getWebsiteValues'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'getWebsiteValues'>> {
    return this.execute('getWebsiteValues', input, options);
  }

  /**
   * Set up two-factor authentication
   * Starts or replaces the current user's pending setup and returns a QR code and manual setup key for an authenticator app.
   * `POST /api/2fa/setup/initiate`
   */
  initiateTwoFactorSetup(
    input?: OperationInput<'initiateTwoFactorSetup'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'initiateTwoFactorSetup'>> {
    return this.execute('initiateTwoFactorSetup', input, options);
  }

  /**
   * Join a team
   * Adds the current user to a team as a member using the team's access code.
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
   * Returns a paginated list of the current user's websites, optionally including websites accessible through team membership.
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
   * Authenticates a user with a username and password. Users with two-factor authentication receive a short-lived partial token to complete sign-in.
   * `POST /api/auth/login`
   */
  login(
    input: OperationInput<'login'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'login'>> {
    return this.execute('login', input, options);
  }

  /**
   * Log out
   * Ends the current authentication session by removing its stored token when Redis-backed sessions are enabled.
   * `POST /api/auth/logout`
   */
  logout(
    input?: OperationInput<'logout'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'logout'>> {
    return this.execute('logout', input, options);
  }

  /**
   * Send session recordings or heatmap data
   * Stores session replay events or heatmap clicks and scrolls for a website, using a valid tracking cache token to identify the session and visit.
   * `POST /api/record`
   */
  record(
    input: OperationInput<'record'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'record'>> {
    return this.execute('record', input, options);
  }

  /**
   * Reset website analytics
   * Clears the website's collected analytics data while keeping the website configuration.
   * `POST /api/websites/{websiteId}/reset`
   */
  resetWebsite(
    input: OperationInput<'resetWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'resetWebsite'>> {
    return this.execute('resetWebsite', input, options);
  }

  /**
   * Run an attribution report
   * Calculates how traffic sources contribute to conversions using the supplied attribution settings, date range, and filters.
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
   * Run a breakdown report
   * Groups website activity by the selected dimensions for the requested date range and filters.
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
   * Run a funnel report
   * Calculates visitor progression through a sequence of pages or events using the supplied funnel steps and filters.
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
   * Run a goal report
   * Counts visitors who reached a matching page or triggered a matching event and returns the total visitor count for comparison.
   * `POST /api/reports/goal`
   */
  runGoalReport(
    input: OperationInput<'runGoalReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runGoalReport'>> {
    return this.execute('runGoalReport', input, options);
  }

  /**
   * Get page heatmap data
   * Returns recorded click or scroll data for the selected page and date range to display as a heatmap.
   * `POST /api/reports/heatmap`
   */
  runHeatmapReport(
    input: OperationInput<'runHeatmapReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runHeatmapReport'>> {
    return this.execute('runHeatmapReport', input, options);
  }

  /**
   * Run a visitor journey report
   * Returns paths through pages or events using the supplied journey settings and website filters.
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
   * Run a performance report
   * Returns performance trends, summary metrics, and breakdowns by page, page title, device, and browser for the selected website and date range.
   * `POST /api/reports/performance`
   */
  runPerformanceReport(
    input: OperationInput<'runPerformanceReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'runPerformanceReport'>> {
    return this.execute('runPerformanceReport', input, options);
  }

  /**
   * Run a retention report
   * Calculates how groups of visitors return over time using the supplied retention settings, date range, and filters.
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
   * Run a revenue report
   * Returns revenue trends, totals with a comparison period, and breakdowns by country, region, referrer, and channel.
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
   * Run a campaign report
   * Returns traffic breakdowns for UTM source, medium, campaign, term, and content using the supplied date range and filters.
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
   * Save or unsave a session replay
   * Adds a replay to the website's saved replays with an optional name, or removes it when isSaved is false.
   * `POST /api/websites/{websiteId}/replays/saved/{replayId}`
   */
  saveWebsiteReplay(
    input: OperationInput<'saveWebsiteReplay'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'saveWebsiteReplay'>> {
    return this.execute('saveWebsiteReplay', input, options);
  }

  /**
   * Send tracking data
   * Collects a pageview, custom event, visitor identification, or performance payload and returns session information and a tracking cache token when accepted.
   * `POST /api/send`
   */
  send(input: OperationInput<'send'>, options?: RequestOptions): Promise<OperationOutput<'send'>> {
    return this.execute('send', input, options);
  }

  /**
   * Create a single sign-on token
   * Returns the authenticated user and a new token valid for 24 hours. Requires Redis-backed authentication.
   * `POST /api/auth/sso`
   */
  sso(input?: OperationInput<'sso'>, options?: RequestOptions): Promise<OperationOutput<'sso'>> {
    return this.execute('sso', input, options);
  }

  /**
   * Transfer website ownership
   * Transfers the specified website to another user or team after checking permission for the destination.
   * `POST /api/websites/{websiteId}/transfer`
   */
  transferWebsite(
    input: OperationInput<'transferWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'transferWebsite'>> {
    return this.execute('transferWebsite', input, options);
  }

  /**
   * Update a board
   * Updates a board's name, description, or configuration and validates the resources and reports it references.
   * `POST /api/boards/{boardId}`
   */
  updateBoard(
    input: OperationInput<'updateBoard'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateBoard'>> {
    return this.execute('updateBoard', input, options);
  }

  /**
   * Update a tracked link
   * Updates a tracked link's name, destination URL, or slug.
   * `POST /api/links/{linkId}`
   */
  updateLink(
    input: OperationInput<'updateLink'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateLink'>> {
    return this.execute('updateLink', input, options);
  }

  /**
   * Change my password
   * Verifies the current password and replaces it with the supplied new password.
   * `POST /api/me/password`
   */
  updateMyPassword(
    input: OperationInput<'updateMyPassword'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateMyPassword'>> {
    return this.execute('updateMyPassword', input, options);
  }

  /**
   * Update a tracking pixel
   * Updates a tracking pixel's name or slug.
   * `POST /api/pixels/{pixelId}`
   */
  updatePixel(
    input: OperationInput<'updatePixel'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updatePixel'>> {
    return this.execute('updatePixel', input, options);
  }

  /**
   * Update a saved report
   * Updates the specified report's website, name, description, type, and parameters.
   * `POST /api/reports/{reportId}`
   */
  updateReport(
    input: OperationInput<'updateReport'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateReport'>> {
    return this.execute('updateReport', input, options);
  }

  /**
   * Update a share
   * Updates the specified share's name, slug, and parameters.
   * `POST /api/share/id/{shareId}`
   */
  updateShare(
    input: OperationInput<'updateShare'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateShare'>> {
    return this.execute('updateShare', input, options);
  }

  /**
   * Update a team
   * Updates the specified team's name or access code.
   * `POST /api/teams/{teamId}`
   */
  updateTeam(
    input: OperationInput<'updateTeam'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateTeam'>> {
    return this.execute('updateTeam', input, options);
  }

  /**
   * Change a team member's role
   * Updates a user's role in the specified team, subject to the caller's role and permissions.
   * `POST /api/teams/{teamId}/users/{userId}`
   */
  updateTeamUser(
    input: OperationInput<'updateTeamUser'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateTeamUser'>> {
    return this.execute('updateTeamUser', input, options);
  }

  /**
   * Update a user
   * Updates a user's password. Administrators can also change the username and role.
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
   * Updates a website's name, domain, sharing settings, or recording configuration.
   * `POST /api/websites/{websiteId}`
   */
  updateWebsite(
    input: OperationInput<'updateWebsite'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateWebsite'>> {
    return this.execute('updateWebsite', input, options);
  }

  /**
   * Update a website annotation
   * Changes the date, all-day setting, and note for a website annotation.
   * `POST /api/websites/{websiteId}/annotations/{annotationId}`
   */
  updateWebsiteAnnotation(
    input: OperationInput<'updateWebsiteAnnotation'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateWebsiteAnnotation'>> {
    return this.execute('updateWebsiteAnnotation', input, options);
  }

  /**
   * Update a website segment or cohort
   * Updates a saved segment or cohort's type, name, and filter parameters.
   * `POST /api/websites/{websiteId}/segments/{segmentId}`
   */
  updateWebsiteSegment(
    input: OperationInput<'updateWebsiteSegment'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'updateWebsiteSegment'>> {
    return this.execute('updateWebsiteSegment', input, options);
  }

  /**
   * Verify the current sign-in
   * Validates the current authentication credentials and returns the user and their team memberships.
   * `POST /api/auth/verify`
   */
  verify(
    input?: OperationInput<'verify'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'verify'>> {
    return this.execute('verify', input, options);
  }

  /**
   * Complete two-factor sign-in
   * Exchanges a partial sign-in token and a valid authenticator or backup code for a full authentication token and user details.
   * `POST /api/2fa/verify`
   */
  verifyTwoFactor(
    input: OperationInput<'verifyTwoFactor'>,
    options?: RequestOptions,
  ): Promise<OperationOutput<'verifyTwoFactor'>> {
    return this.execute('verifyTwoFactor', input, options);
  }
}
