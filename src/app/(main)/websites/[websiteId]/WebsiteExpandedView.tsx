import { Grid, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';
import { SideMenu } from '@/components/common/SideMenu';

export function WebsiteExpandedView({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const {
    updateParams,
    query: { view },
  } = useNavigation();

  const items = [
    {
      label: formatMessage(labels.pages),
      items: [
        {
          id: 'path',
          label: formatMessage(labels.path),
          path: updateParams({ view: 'path' }),
        },
        {
          id: 'entry',
          label: formatMessage(labels.entry),
          path: updateParams({ view: 'entry' }),
        },
        {
          id: 'exit',
          label: formatMessage(labels.exit),
          path: updateParams({ view: 'exit' }),
        },
        {
          id: 'title',
          label: formatMessage(labels.title),
          path: updateParams({ view: 'title' }),
        },
        {
          id: 'query',
          label: formatMessage(labels.query),
          path: updateParams({ view: 'query' }),
        },
      ],
    },
    {
      label: formatMessage(labels.sources),
      items: [
        {
          id: 'referrer',
          label: formatMessage(labels.referrer),
          path: updateParams({ view: 'referrer' }),
        },
        {
          id: 'channel',
          label: formatMessage(labels.channel),
          path: updateParams({ view: 'channel' }),
        },
        {
          id: 'domain',
          label: formatMessage(labels.domain),
          path: updateParams({ view: 'domain' }),
        },
      ],
    },
    {
      label: formatMessage(labels.location),
      items: [
        {
          id: 'country',
          label: formatMessage(labels.country),
          path: updateParams({ view: 'country' }),
        },
        {
          id: 'region',
          label: formatMessage(labels.region),
          path: updateParams({ view: 'region' }),
        },
        {
          id: 'city',
          label: formatMessage(labels.city),
          path: updateParams({ view: 'city' }),
        },
      ],
    },
    {
      label: formatMessage(labels.environment),
      items: [
        {
          id: 'browser',
          label: formatMessage(labels.browser),
          path: updateParams({ view: 'browser' }),
        },
        {
          id: 'os',
          label: formatMessage(labels.os),
          path: updateParams({ view: 'os' }),
        },
        {
          id: 'device',
          label: formatMessage(labels.device),
          path: updateParams({ view: 'device' }),
        },
        {
          id: 'language',
          label: formatMessage(labels.language),
          path: updateParams({ view: 'language' }),
        },
        {
          id: 'screen',
          label: formatMessage(labels.screen),
          path: updateParams({ view: 'screen' }),
        },
      ],
    },
    {
      label: formatMessage(labels.other),
      items: [
        {
          id: 'event',
          label: formatMessage(labels.event),
          path: updateParams({ view: 'event' }),
        },
        {
          id: 'hostname',
          label: formatMessage(labels.hostname),
          path: updateParams({ view: 'hostname' }),
        },
        {
          id: 'tag',
          label: formatMessage(labels.tag),
          path: updateParams({ view: 'tag' }),
        },
      ],
    },
  ];

  return (
    <Grid columns="auto 1fr" gap="6" height="100%" overflow="hidden">
      <Column gap="6" border="right" paddingRight="3">
        <SideMenu items={items} selectedKey={view} />
      </Column>
      <Column overflow="hidden">
        <MetricsExpandedTable
          title={formatMessage(labels[view])}
          type={view}
          websiteId={websiteId}
          onClose={onClose}
        />
      </Column>
    </Grid>
  );
}
