'use client';
import { Grid, Row, Column } from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useWebsiteSessionQuery } from '@/components/hooks';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionInfo } from './SessionInfo';
import { SessionStats } from './SessionStats';

export function SessionDetailsPage({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { data, ...query } = useWebsiteSessionQuery(websiteId, sessionId);

  return (
    <LoadingPanel {...query} loadingIcon="spinner" data={data}>
      <WebsiteHeader websiteId={websiteId} />
      <Grid
        gap="9"
        columns={{ xs: '1fr', sm: '1fr', md: '1fr 1fr', lg: '1fr 2fr 1fr', xl: '1fr 2fr 1fr' }}
      >
        <Column gap="6" maxWidth="200px">
          <Row justifyContent="center">
            <Avatar seed={data?.id} size={128} />
          </Row>
          <SessionInfo data={data} />
        </Column>
        <Column gap="6">
          <SessionStats data={data} />
          <SessionActivity
            websiteId={websiteId}
            sessionId={sessionId}
            startDate={data?.firstAt}
            endDate={data?.lastAt}
          />
        </Column>
        <Column gap="6">
          <SessionData websiteId={websiteId} sessionId={sessionId} />
        </Column>
      </Grid>
    </LoadingPanel>
  );
}
