'use client';
import { Grid, Loading } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Funnel } from './Funnel';
import { FunnelAddButton } from './FunnelAddButton';
import { WebsiteControls } from '../WebsiteControls';
import { useDateRange, useReportsQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';

export function FunnelsPage({ websiteId }: { websiteId: string }) {
  const { result } = useReportsQuery({ websiteId, type: 'funnel' });
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  if (!result) {
    return <Loading position="page" />;
  }

  return (
    <>
      <WebsiteControls websiteId={websiteId} />
      <LoadingPanel isEmpty={!result?.data} isLoading={!result}>
        <SectionHeader>
          <FunnelAddButton websiteId={websiteId} />
        </SectionHeader>
        <Grid gap>
          {result?.data?.map((report: any) => (
            <Panel key={report.id}>
              <Funnel {...report} startDate={startDate} endDate={endDate} />
            </Panel>
          ))}
        </Grid>
      </LoadingPanel>
    </>
  );
}
