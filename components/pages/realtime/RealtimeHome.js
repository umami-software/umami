import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import useApi from 'hooks/useApi';
import { labels, messages } from 'components/messages';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';

export default function RealtimeHome() {
  const { formatMessage } = useIntl();
  const { get, useQuery } = useApi();
  const router = useRouter();
  const { data, isLoading, error } = useQuery(['websites:me'], () => get('/me/websites'));

  useEffect(() => {
    if (data?.length) {
      router.push(`realtime/${data[0].id}`);
    }
  }, [data, router]);

  return (
    <Page loading={isLoading || data?.length > 0} error={error}>
      <PageHeader title={formatMessage(labels.realtime)} />
      {data?.length === 0 && <EmptyPlaceholder message={formatMessage(messages.noWebsites)} />}
    </Page>
  );
}
