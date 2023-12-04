'use client';
import { useEffect, useState } from 'react';
import { Item, Tabs, useToasts, Button, Text, Icon, Icons, Loading } from 'react-basics';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from 'components/layout/PageHeader';
import WebsiteEditForm from './[id]/WebsiteEditForm';
import WebsiteData from './[id]/WebsiteData';
import TrackingCode from './[id]/TrackingCode';
import ShareUrl from './[id]/ShareUrl';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';

export function WebsiteSettings({ websiteId, openExternal = false, analyticsUrl }) {
  const router = useRouter();
  const { formatMessage, labels, messages } = useMessages();
  const { get, useQuery } = useApi();
  const { showToast } = useToasts();
  const { data, isLoading } = useQuery({
    queryKey: ['website', websiteId],
    queryFn: () => get(`/websites/${websiteId}`),
    enabled: !!websiteId,
    gcTime: 0,
  });
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');

  const showSuccess = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleSave = data => {
    showSuccess();
    setValues(state => ({ ...state, ...data }));
  };

  const handleReset = async value => {
    if (value === 'delete') {
      router.push('/settings/websites');
    } else if (value === 'reset') {
      showSuccess();
    }
  };

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  if (isLoading || !values) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title={values?.name}>
        <Link href={`/websites/${websiteId}`} target={openExternal ? '_blank' : null}>
          <Button variant="primary">
            <Icon>
              <Icons.External />
            </Icon>
            <Text>{formatMessage(labels.view)}</Text>
          </Button>
        </Link>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="tracking">{formatMessage(labels.trackingCode)}</Item>
        <Item key="share">{formatMessage(labels.shareUrl)}</Item>
        <Item key="data">{formatMessage(labels.data)}</Item>
      </Tabs>
      {tab === 'details' && (
        <WebsiteEditForm websiteId={websiteId} data={values} onSave={handleSave} />
      )}
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} analyticsUrl={analyticsUrl} />}
      {tab === 'share' && (
        <ShareUrl
          websiteId={websiteId}
          data={values}
          analyticsUrl={analyticsUrl}
          onSave={handleSave}
        />
      )}
      {tab === 'data' && <WebsiteData websiteId={websiteId} onSave={handleReset} />}
    </>
  );
}

export default WebsiteSettings;
