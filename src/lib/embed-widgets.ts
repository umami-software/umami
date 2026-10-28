export interface EmbedWidgetDef {
  id: string;
  label: string;
  description: string;
  type: string; // board component type
  props?: Record<string, any>;
}

/** Widgets offered in the "Embed widgets" builder; they map to board components. */
export const EMBED_WIDGETS: EmbedWidgetDef[] = [
  {
    id: 'metrics',
    label: 'Key metrics',
    description: 'Visitors, visits, views, bounce rate, duration',
    type: 'WebsiteMetricsBar',
  },
  {
    id: 'chart',
    label: 'Visitors chart',
    description: 'Visitors and views over time',
    type: 'WebsiteChart',
  },
  {
    id: 'pages',
    label: 'Top pages',
    description: 'Most viewed pages',
    type: 'MetricsTable',
    props: { type: 'path', limit: 10 },
  },
  {
    id: 'sources',
    label: 'Traffic sources',
    description: 'Referrers',
    type: 'MetricsTable',
    props: { type: 'referrer', limit: 10 },
  },
  {
    id: 'countries',
    label: 'Top countries',
    description: 'Visitors by country',
    type: 'MetricsTable',
    props: { type: 'country', limit: 10 },
  },
  { id: 'events', label: 'Events', description: 'Custom events over time', type: 'EventsChart' },
  { id: 'map', label: 'World map', description: 'Visitors on a map', type: 'WorldMap' },
];

export const EMBED_PERIODS = [
  { value: '24hour', label: 'Last 24 hours' },
  { value: '7day', label: 'Last 7 days' },
  { value: '30day', label: 'Last 30 days' },
  { value: '90day', label: 'Last 90 days' },
];
