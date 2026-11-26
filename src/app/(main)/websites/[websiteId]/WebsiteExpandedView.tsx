import { Column, Grid, Row } from '@umami/react-zen';
import { WebsiteExpandedMenu } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';

export function WebsiteExpandedView({
  websiteId,
  excludedIds = [],
  defaultView = 'path',
}: {
  websiteId: string;
  excludedIds?: string[];
  /** Shown when the URL has no `view` param. */
  defaultView?: string;
}) {
  const { t, labels } = useMessages();
  const { query } = useNavigation();
  const view = query.view || defaultView;
  const title = view === 'fullPath' ? t(labels.url) : t(labels[view]);

  return (
    <Column gap>
      <Row display={{ base: 'flex', md: 'none' }}>
        <MobileMenuButton>
          {({ close }) => {
            return (
              <Column padding="3">
                <WebsiteExpandedMenu view={view} excludedIds={excludedIds} onItemClick={close} />
              </Column>
            );
          }}
        </MobileMenuButton>
      </Row>
      <Grid columns={{ base: '1fr', md: 'auto 1fr' }} gap="6">
        <Column display={{ base: 'none', md: 'flex' }} width="240px">
          <WebsiteExpandedMenu view={view} excludedIds={excludedIds} />
        </Column>
        <Column minWidth="0" alignSelf="start">
          <MetricsExpandedTable title={title} type={view} websiteId={websiteId} />
        </Column>
      </Grid>
    </Column>
  );
}
