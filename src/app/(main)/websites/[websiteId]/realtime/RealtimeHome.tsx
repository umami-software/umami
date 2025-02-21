import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import { useApi, useMessages } from '@/components/hooks';
import EmptyPlaceholder from '@/components/common/EmptyPlaceholder';

export function RealtimeHome() {
  const { formatMessage, labels, messages } = useMessages();
  const { get, useQuery } = useApi();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['websites:me'],
    queryFn: () => get('/me/websites'),
  });

  useEffect(() => {
    if (data?.length) {
      router.push(`realtime/${data[0].id}`);
    }
  }, [data, router]);

  return (
    <Page isLoading={isLoading || data?.length > 0} error={error}>
      <PageHeader title={formatMessage(labels.realtime)} />
      {data?.length === 0 && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsitesConfigured)} />
      )}
    </Page>
  );
}

export default RealtimeHome;
