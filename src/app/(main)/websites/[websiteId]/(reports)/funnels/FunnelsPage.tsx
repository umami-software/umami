'use client';
import { Grid, Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Funnel } from './Funnel';
import { FunnelAddButton } from './FunnelAddButton';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useReportsQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';

export function FunnelsPage({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useReportsQuery({ websiteId, type: 'funnel' });
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <SectionHeader>
        <FunnelAddButton websiteId={websiteId} />
      </SectionHeader>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <Grid gap>
            {data['data']?.map((report: any) => (
              <Panel key={report.id}>
                <Funnel {...report} startDate={startDate} endDate={endDate} />
              </Panel>
            ))}
          </Grid>
        )}
      </LoadingPanel>
    </Column>
  );
}
