import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageBody } from '@/components/common/PageBody';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useApi, useMessages } from '@/components/hooks';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';

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
    <PageBody isLoading={isLoading || data?.length > 0} error={error}>
      <SectionHeader title={formatMessage(labels.realtime)} />
      {data?.length === 0 && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsitesConfigured)} />
      )}
    </PageBody>
  );
}
