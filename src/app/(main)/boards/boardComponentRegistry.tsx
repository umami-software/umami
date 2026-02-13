import type { ComponentType } from 'react';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { WebsiteMetricsBar } from '@/app/(main)/websites/[websiteId]/WebsiteMetricsBar';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';
import { WorldMap } from '@/components/metrics/WorldMap';

export interface ConfigField {
  name: string;
  label: string;
  type: 'select' | 'number' | 'text';
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  component: ComponentType<any>;
  defaultProps?: Record<string, any>;
  configFields?: ConfigField[];
}

export const CATEGORIES = [
  { key: 'overview', name: 'Overview' },
  { key: 'tables', name: 'Tables' },
  { key: 'visualization', name: 'Visualization' },
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
    component: WebsiteMetricsBar,
  },
  {
    type: 'WebsiteChart',
    name: 'Website chart',
    description: 'Page views and visitors over time',
    category: 'overview',
    component: WebsiteChart,
  },

  // Tables
  {
    type: 'MetricsTable',
    name: 'Metrics table',
    description: 'Table of metrics by dimension',
    category: 'tables',
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
    component: WorldMap,
  },
  {
    type: 'WeeklyTraffic',
    name: 'Weekly traffic',
    description: 'Traffic heatmap by day and hour',
    category: 'visualization',
    component: WeeklyTraffic,
  },
  {
    type: 'EventsChart',
    name: 'Events chart',
    description: 'Custom events over time',
    category: 'visualization',
    component: EventsChart,
  },
];

const definitionMap = new Map(componentDefinitions.map(def => [def.type, def]));

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return definitionMap.get(type);
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return componentDefinitions.filter(def => def.category === category);
}
