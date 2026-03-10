import type { ComponentType } from 'react';
import { TextBlock } from '@/app/(main)/boards/TextBlock';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { WebsiteMetricsBar } from '@/app/(main)/websites/[websiteId]/WebsiteMetricsBar';
import {
  Calendar,
  ChartColumnBig,
  ChartPie,
  FileText,
  Globe,
  PanelTop,
  Sheet,
} from '@/components/icons';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { WorldMap } from '@/components/metrics/WorldMap';

export interface ConfigField {
  name: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'textarea';
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  icon: ComponentType<any>;
  component: ComponentType<any>;
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
  { label: 'Pages', value: 'path' },
  { label: 'Entry pages', value: 'entry' },
  { label: 'Exit pages', value: 'exit' },
  { label: 'Referrers', value: 'referrer' },
  { label: 'Channels', value: 'channel' },
  { label: 'Browsers', value: 'browser' },
  { label: 'OS', value: 'os' },
  { label: 'Devices', value: 'device' },
  { label: 'Countries', value: 'country' },
  { label: 'Regions', value: 'region' },
  { label: 'Cities', value: 'city' },
  { label: 'Languages', value: 'language' },
  { label: 'Screens', value: 'screen' },
  { label: 'Query parameters', value: 'query' },
  { label: 'Page titles', value: 'title' },
  { label: 'Hosts', value: 'host' },
  { label: 'Events', value: 'event' },
];

const LIMIT_OPTIONS = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
];

const componentDefinitions: ComponentDefinition[] = [
  // Overview
  {
    type: 'WebsiteMetricsBar',
    name: 'Metrics bar',
    description: 'Key metrics: views, visitors, bounces, time on site',
    category: 'overview',
    icon: PanelTop,
    component: WebsiteMetricsBar,
  },
  {
    type: 'WebsiteChart',
    name: 'Website chart',
    description: 'Page views and visitors over time',
    category: 'overview',
    icon: ChartColumnBig,
    component: WebsiteChart,
  },

  // Tables
  {
    type: 'MetricsTable',
    name: 'Metrics table',
    description: 'Table of metrics by dimension',
    category: 'tables',
    icon: Sheet,
    component: MetricsTable,
    defaultProps: { type: 'path', limit: 10 },
    configFields: [
      {
        name: 'type',
        label: 'Metric type',
        type: 'select',
        options: METRIC_TYPES,
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
    icon: Globe,
    component: WorldMap,
  },
  {
    type: 'WeeklyTraffic',
    name: 'Weekly traffic',
    description: 'Traffic heatmap by day and hour',
    category: 'visualization',
    icon: Calendar,
    component: WeeklyTraffic,
  },
  {
    type: 'EventsChart',
    name: 'Events chart',
    description: 'Custom events over time',
    category: 'visualization',
    icon: ChartPie,
    component: EventsChart,
  },

  // Content
  {
    type: 'TextBlock',
    name: 'Text',
    description: 'Free-form text content',
    category: 'content',
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
