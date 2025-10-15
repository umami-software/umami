import { Grid, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';
import { WebsiteExpandedMenu } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedMenu';

export function WebsiteExpandedView({
  websiteId,
  excludedIds = [],
  onClose,
}: {
  websiteId: string;
  excludedIds?: string[];
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const {
    query: { view },
  } = useNavigation();

  return (
    <Grid
      columns={{ xs: '1fr', md: 'auto 1fr' }}
      gap="6"
      height="100%"
      overflowX="auto"
      minWidth="500px"
    >
      <Column
        display={{ xs: 'none', md: 'flex' }}
        gap="6"
        border="right"
        paddingRight="3"
        overflowY="auto"
      >
        <WebsiteExpandedMenu excludedIds={excludedIds} />
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
