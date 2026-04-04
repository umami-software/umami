'use client';
import { Column, Grid } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useDateRange, useNavigation, useReportsQuery } from '@/components/hooks';
import { Funnel } from './Funnel';
import { FunnelAddButton } from './FunnelAddButton';

export function FunnelsPage({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useReportsQuery({ websiteId, type: 'funnel' });
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      {!isSharePage && (
        <SectionHeader>
          <FunnelAddButton websiteId={websiteId} />
        </SectionHeader>
      )}
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <Grid gap>
            {data.data?.map((report: any) => (
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
