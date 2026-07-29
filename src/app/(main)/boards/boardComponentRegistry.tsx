import type { ComponentType } from 'react';
import { TextBlock } from '@/app/(main)/boards/TextBlock';
import { BoardFunnel } from '@/app/(main)/websites/[websiteId]/(reports)/funnels/BoardFunnel';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { PixelMetricsBar } from '@/app/(main)/pixels/[pixelId]/PixelMetricsBar';
import { BoardGoal } from '@/app/(main)/websites/[websiteId]/(reports)/goals/BoardGoal';
import { BoardRevenueChart } from '@/app/(main)/websites/[websiteId]/(reports)/revenue/BoardRevenueChart';
import { BoardRevenueMetricsBar } from '@/app/(main)/websites/[websiteId]/(reports)/revenue/BoardRevenueMetricsBar';
import { BoardRevenueMetricsTable } from '@/app/(main)/websites/[websiteId]/(reports)/revenue/BoardRevenueMetricsTable';
import { BoardUTM } from '@/app/(main)/websites/[websiteId]/(reports)/utm/BoardUTM';
import { EventsMetricsBar } from '@/app/(main)/websites/[websiteId]/events/EventsMetricsBar';
import { BoardRealtimeActiveUsers } from '@/app/(main)/websites/[websiteId]/realtime/BoardRealtimeActiveUsers';
import { BoardRealtimeChart } from '@/app/(main)/websites/[websiteId]/realtime/BoardRealtimeChart';
import { BoardRealtimeMetricsBar } from '@/app/(main)/websites/[websiteId]/realtime/BoardRealtimeMetricsBar';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { WebsiteMetricsBar } from '@/app/(main)/websites/[websiteId]/WebsiteMetricsBar';
import {
  Activity,
  Calendar,
  ChartColumnBig,
  ChartPie,
  FileText,
  GitBranch,
  Globe,
  PanelTop,
  Sheet,
  Target,
  Users,
} from '@/components/icons';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/constants';

export interface ConfigField {
  name: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'textarea' | 'report';
  options?: { label: string; value: string }[];
  optionsByEntityType?: Record<string, { label: string; value: string }[]>;
  defaultValue?: any;
  reportType?: string;
  required?: boolean;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  group?: string;
  icon: ComponentType<any>;
  component: ComponentType<any>;
  componentByEntityType?: Record<string, ComponentType<any>>;
  defaultProps?: Record<string, any>;
  configFields?: ConfigField[];
  requiresWebsite?: boolean;
}

export const CATEGORIES = [
  { key: 'overview', name: 'Overview' },
  { key: 'tables', name: 'Tables' },
  { key: 'visualization', name: 'Visualization' },
  { key: 'content', name: 'Content' },
] as const;

const METRIC_TYPES = [
  { label: 'Path', value: 'path' },
  { label: 'URL', value: 'fullPath' },
  { label: 'Entry page', value: 'entry' },
  { label: 'Exit page', value: 'exit' },
  { label: 'Title', value: 'title' },
  { label: 'Query', value: 'query' },
  { label: 'Referrer', value: 'referrer' },
  { label: 'Channel', value: 'channel' },
  { label: 'Country', value: 'country' },
  { label: 'Region', value: 'region' },
  { label: 'City', value: 'city' },
  { label: 'Browser', value: 'browser' },
  { label: 'OS', value: 'os' },
  { label: 'Device', value: 'device' },
  { label: 'Language', value: 'language' },
  { label: 'Screen', value: 'screen' },
  { label: 'UTM Source', value: 'utmSource' },
  { label: 'UTM Medium', value: 'utmMedium' },
  { label: 'UTM Campaign', value: 'utmCampaign' },
  { label: 'UTM Content', value: 'utmContent' },
  { label: 'UTM Term', value: 'utmTerm' },
  { label: 'Event', value: 'event' },
  { label: 'Hostname', value: 'hostname' },
];

const PIXEL_LINK_METRIC_TYPES = METRIC_TYPES.filter(({ value }) =>
  [
    'referrer',
    'channel',
    'browser',
    'os',
    'device',
    'country',
    'region',
    'city',
  ].includes(value),
);

const LIMIT_OPTIONS = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
];

const UTM_PARAM_OPTIONS = [
  { label: 'Source', value: 'utm_source' },
  { label: 'Medium', value: 'utm_medium' },
  { label: 'Campaign', value: 'utm_campaign' },
  { label: 'Content', value: 'utm_content' },
  { label: 'Term', value: 'utm_term' },
];

const REVENUE_METRIC_TYPE_OPTIONS = [
  { label: 'Referrers', value: 'referrer' },
  { label: 'Channels', value: 'channel' },
  { label: 'Countries', value: 'country' },
  { label: 'Regions', value: 'region' },
];

const CURRENCY_OPTIONS = CURRENCIES.map(({ id, name }) => ({
  label: `${id} - ${name}`,
  value: id,
}));

const PixelMetricsBarAdapter = ({ websiteId }: { websiteId?: string }) =>
  websiteId ? <PixelMetricsBar pixelId={websiteId} /> : null;

const LinkMetricsBarAdapter = ({ websiteId }: { websiteId?: string }) =>
  websiteId ? <LinkMetricsBar linkId={websiteId} /> : null;

const componentDefinitions: ComponentDefinition[] = [
  // Overview
  {
    type: 'WebsiteMetricsBar',
    name: 'Metrics bar',
    description: 'Key metrics: views, visitors, bounces, time on site',
    category: 'overview',
    group: 'Traffic',
    icon: PanelTop,
    component: WebsiteMetricsBar,
    componentByEntityType: {
      pixel: PixelMetricsBarAdapter,
      link: LinkMetricsBarAdapter,
    },
  },
  {
    type: 'EventsMetricsBar',
    name: 'Event metrics bar',
    description: 'Key metrics: visitors, visits, events, unique events',
    category: 'overview',
    group: 'Events',
    icon: PanelTop,
    component: EventsMetricsBar,
  },
  {
    type: 'Goal',
    name: 'Goal',
    description: 'Conversion progress for a saved goal',
    category: 'overview',
    group: 'Behavior',
    icon: Target,
    component: BoardGoal,
    configFields: [
      {
        name: 'reportId',
        label: 'Saved goal',
        type: 'report',
        reportType: 'goal',
        required: true,
      },
    ],
  },
  {
    type: 'Funnel',
    name: 'Funnel',
    description: 'Step conversion for a saved funnel',
    category: 'overview',
    group: 'Behavior',
    icon: GitBranch,
    component: BoardFunnel,
    configFields: [
      {
        name: 'reportId',
        label: 'Saved funnel',
        type: 'report',
        reportType: 'funnel',
        required: true,
      },
    ],
  },
  {
    type: 'WebsiteChart',
    name: 'Visitors chart',
    description: 'Page views and visitors over time',
    category: 'overview',
    group: 'Traffic',
    icon: ChartColumnBig,
    component: WebsiteChart,
  },
  {
    type: 'UTM',
    name: 'UTM',
    description: 'List and pie chart for one UTM parameter',
    category: 'visualization',
    group: 'Growth',
    icon: ChartPie,
    component: BoardUTM,
    defaultProps: { param: 'utm_source', limit: 10 },
    configFields: [
      {
        name: 'param',
        label: 'UTM param',
        type: 'select',
        options: UTM_PARAM_OPTIONS,
        defaultValue: 'utm_source',
      },
      {
        name: 'limit',
        label: 'Rows',
        type: 'select',
        options: LIMIT_OPTIONS,
        defaultValue: '10',
      },
    ],
  },
  {
    type: 'RealtimeHeader',
    name: 'Realtime metrics bar',
    description: 'Live views, visitors, events, and countries',
    category: 'overview',
    group: 'Realtime',
    icon: PanelTop,
    component: BoardRealtimeMetricsBar,
  },
  {
    type: 'RealtimeChart',
    name: 'Realtime chart',
    description: 'Live visitors and page views by minute',
    category: 'visualization',
    group: 'Realtime',
    icon: Activity,
    component: BoardRealtimeChart,
  },
  {
    type: 'RealtimeActiveUsers',
    name: 'Active users',
    description: 'Current visitors online',
    category: 'overview',
    group: 'Realtime',
    icon: Users,
    component: BoardRealtimeActiveUsers,
  },
  {
    type: 'RevenueMetricsBar',
    name: 'Revenue metrics bar',
    description: 'Revenue summary: total, AOV, ARPU, orders, and customers',
    category: 'overview',
    group: 'Revenue',
    icon: PanelTop,
    component: BoardRevenueMetricsBar,
    defaultProps: { currency: DEFAULT_CURRENCY },
    configFields: [
      {
        name: 'currency',
        label: 'Currency',
        type: 'select',
        options: CURRENCY_OPTIONS,
        defaultValue: DEFAULT_CURRENCY,
      },
    ],
  },
  {
    type: 'RevenueChart',
    name: 'Revenue chart',
    description: 'Revenue over time',
    category: 'visualization',
    group: 'Revenue',
    icon: ChartColumnBig,
    component: BoardRevenueChart,
    defaultProps: { currency: DEFAULT_CURRENCY },
    configFields: [
      {
        name: 'currency',
        label: 'Currency',
        type: 'select',
        options: CURRENCY_OPTIONS,
        defaultValue: DEFAULT_CURRENCY,
      },
    ],
  },
  {
    type: 'RevenueMetricsTable',
    name: 'Revenue metrics table',
    description: 'Revenue breakdown by source or location',
    category: 'tables',
    group: 'Revenue',
    icon: Sheet,
    component: BoardRevenueMetricsTable,
    defaultProps: { type: 'referrer', currency: DEFAULT_CURRENCY },
    configFields: [
      {
        name: 'type',
        label: 'Metric type',
        type: 'select',
        options: REVENUE_METRIC_TYPE_OPTIONS,
        defaultValue: 'referrer',
      },
      {
        name: 'currency',
        label: 'Currency',
        type: 'select',
        options: CURRENCY_OPTIONS,
        defaultValue: DEFAULT_CURRENCY,
      },
    ],
  },

  // Tables
  {
    type: 'MetricsTable',
    name: 'Metrics table',
    description: 'Table of metrics by dimension',
    category: 'tables',
    group: 'Traffic',
    icon: Sheet,
    component: MetricsTable,
    defaultProps: { type: 'path', limit: 10 },
    configFields: [
      {
        name: 'type',
        label: 'Metric type',
        type: 'select',
        options: METRIC_TYPES,
        optionsByEntityType: {
          pixel: PIXEL_LINK_METRIC_TYPES,
          link: PIXEL_LINK_METRIC_TYPES,
        },
        defaultValue: 'path',
      },
      {
        name: 'limit',
        label: 'Rows',
        type: 'select',
        options: LIMIT_OPTIONS,
        defaultValue: '10',
      },
    ],
  },

  // Visualization
  {
    type: 'WorldMap',
    name: 'World map',
    description: 'Geographic distribution of visitors',
    category: 'visualization',
    group: 'Traffic',
    icon: Globe,
    component: WorldMap,
  },
  {
    type: 'WeeklyTraffic',
    name: 'Weekly traffic',
    description: 'Traffic heatmap by day and hour',
    category: 'visualization',
    group: 'Traffic',
    icon: Calendar,
    component: WeeklyTraffic,
  },
  {
    type: 'EventsChart',
    name: 'Events chart',
    description: 'Custom events over time',
    category: 'visualization',
    group: 'Events',
    icon: ChartPie,
    component: EventsChart,
  },

  // Content
  {
    type: 'TextBlock',
    name: 'Text',
    description: 'Free-form text content',
    category: 'content',
    group: 'Content',
    icon: FileText,
    component: TextBlock,
    requiresWebsite: false,
    defaultProps: { text: '' },
    configFields: [
      {
        name: 'text',
        label: 'Text',
        type: 'textarea',
        defaultValue: '',
      },
    ],
  },
];

const definitionMap = new Map(componentDefinitions.map(def => [def.type, def]));

export function getComponentDefinitions(): ComponentDefinition[] {
  return componentDefinitions;
}

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return definitionMap.get(type);
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return componentDefinitions.filter(def => def.category === category);
}
