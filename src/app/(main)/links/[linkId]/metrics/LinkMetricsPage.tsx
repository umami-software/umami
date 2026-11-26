'use client';
import { Column, Grid } from '@umami/react-zen';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { WebsiteExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedView';
import { PageBody } from '@/components/common/PageBody';

const excludedIds = ['path', 'fullPath', 'entry', 'exit', 'title', 'language', 'screen', 'event'];

export function LinkMetricsPage({
  linkId,
  showHeaderActions = true,
}: {
  linkId: string;
  showHeaderActions?: boolean;
}) {
  return (
    <LinkProvider linkId={linkId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <LinkHeader showActions={showHeaderActions} />
            <Column gap="6">
              <LinkControls linkId={linkId} />
              <WebsiteExpandedView
                websiteId={linkId}
                excludedIds={excludedIds}
                defaultView="referrer"
              />
            </Column>
          </PageBody>
        </Column>
      </Grid>
    </LinkProvider>
  );
}
