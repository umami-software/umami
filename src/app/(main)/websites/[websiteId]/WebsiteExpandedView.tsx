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
    <Column height="100%" overflow="hidden" gap>
      <Row id="expanded-mobile-menu-button" display={{ xs: 'flex', md: 'none' }}>
        <MobileMenuButton>
          {({ close }) => {
            return (
              <Column padding="3">
                <WebsiteExpandedMenu excludedIds={excludedIds} onItemClick={close} />
              </Column>
            );
          }}
        </MobileMenuButton>
      </Row>
      <Grid columns={{ xs: '1fr', md: 'auto 1fr' }} gap="6" overflow="hidden">
        <Column
          id="metrics-expanded-menu"
          display={{ xs: 'none', md: 'flex' }}
          width="240px"
          gap="6"
          border="right"
          paddingRight="3"
          overflow="auto"
        >
          <WebsiteExpandedMenu excludedIds={excludedIds} />
        </Column>
        <Column id="metrics-expanded-table" overflow="hidden">
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
