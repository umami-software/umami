import { Grid, Column, Row } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';
import { WebsiteExpandedMenu } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedMenu';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';

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
    <Column gap>
      <Row display={{ xs: 'flex', md: 'none' }}>
        <MobileMenuButton>
          {({ close }) => {
            return <WebsiteExpandedMenu excludedIds={excludedIds} onItemClick={close} />;
          }}
        </MobileMenuButton>
      </Row>
      <Grid columns={{ xs: '1fr', md: 'auto 1fr' }} gap="6" height="100%" overflow="hidden">
        <Column
          display={{ xs: 'none', md: 'flex' }}
          gap="6"
          border="right"
          paddingRight="3"
          overflow="auto"
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
    </Column>
  );
}
