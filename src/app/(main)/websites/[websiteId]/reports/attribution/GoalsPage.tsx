'use client';
import { Grid, Loading } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Goal } from './Goal';
import { GoalAddButton } from './GoalAddButton';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useReportsQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';

export function GoalsPage({ websiteId }: { websiteId: string }) {
  const { result } = useReportsQuery({ websiteId, type: 'goal' });
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
          <GoalAddButton websiteId={websiteId} />
        </SectionHeader>
        <Grid columns="1fr 1fr" gap>
          {result?.data?.map((report: any) => (
            <Panel key={report.id}>
              <Goal {...report} reportId={report.id} startDate={startDate} endDate={endDate} />
            </Panel>
          ))}
        </Grid>
      </LoadingPanel>
    </>
  );
}
