import { Text } from '@umami/react-zen';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange } from '@/components/hooks';
import { Link2Off } from '@/components/icons';
import { useReportQuery } from '@/components/hooks/queries/useReportQuery';
import { Goal } from './Goal';

export function BoardGoal({
  websiteId,
  reportId,
  isPreview,
}: {
  websiteId: string;
  reportId?: string;
  isPreview?: boolean;
}) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const { data, isLoading, error, isFetching } = useReportQuery(reportId || '');

  if (!reportId) {
    return (
      <EmptyPlaceholder
        {...(isPreview
          ? {
              title: 'Select a goal',
              description: 'Choose a saved goal to preview.',
            }
          : {
              icon: <Link2Off />,
              title: 'Reconnect goal',
              description: 'Choose a goal for this website.',
            })}
      />
    );
  }

  if (data && (data.type !== 'goal' || data.websiteId !== websiteId)) {
    return (
      <EmptyPlaceholder
        title="Goal unavailable"
        description="This saved goal is no longer available for the selected website."
      />
    );
  }

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data ? (
        <Goal
          id={data.id}
          name={data.name}
          type={data.type}
          parameters={data.parameters}
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          allowEdit={false}
        />
      ) : (
        <Text color="muted">Goal unavailable</Text>
      )}
    </LoadingPanel>
  );
}
