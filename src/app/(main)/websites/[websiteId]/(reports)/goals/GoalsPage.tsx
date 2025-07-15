'use client';
import { Grid, Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Goal } from './Goal';
import { GoalAddButton } from './GoalAddButton';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useReportsQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';

export function GoalsPage({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useReportsQuery({ websiteId, type: 'goal' });
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <SectionHeader>
        <GoalAddButton websiteId={websiteId} />
      </SectionHeader>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <Grid columns="1fr 1fr" gap>
            {data['data'].map((report: any) => (
              <Panel key={report.id}>
                <Goal {...report} startDate={startDate} endDate={endDate} />
              </Panel>
            ))}
          </Grid>
        )}
      </LoadingPanel>
    </Column>
  );
}
