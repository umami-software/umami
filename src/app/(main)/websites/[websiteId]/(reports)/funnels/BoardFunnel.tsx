import { Text } from '@umami/react-zen';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Link2Off } from '@/components/icons';
import { useReportQuery } from '@/components/hooks/queries/useReportQuery';
import { Funnel } from './Funnel';

export function BoardFunnel({
  websiteId,
  reportId,
  isPreview,
}: {
  websiteId: string;
  reportId?: string;
  isPreview?: boolean;
}) {
  const { data, isLoading, error, isFetching } = useReportQuery(reportId || '');

  if (!reportId) {
    return (
      <EmptyPlaceholder
        {...(isPreview
          ? {
              title: 'Select a funnel',
              description: 'Choose a saved funnel to preview.',
            }
          : {
              icon: <Link2Off />,
              title: 'Reconnect funnel',
              description: 'Choose a funnel for this website.',
            })}
      />
    );
  }

  if (data && (data.type !== 'funnel' || data.websiteId !== websiteId)) {
    return (
      <EmptyPlaceholder
        title="Funnel unavailable"
        description="This saved funnel is no longer available for the selected website."
      />
    );
  }

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data ? (
        <Funnel
          id={data.id}
          name={data.name}
          type={data.type}
          parameters={data.parameters}
          websiteId={websiteId}
          allowEdit={false}
        />
      ) : (
        <Text color="muted">Funnel unavailable</Text>
      )}
    </LoadingPanel>
  );
}
