'use client';
import { useContext, useEffect, useState, Key } from 'react';
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
import SettingsContext from '../SettingsContext';

export function WebsiteSettings({ websiteId, openExternal = false }) {
  const router = useRouter();
  const { formatMessage, labels, messages } = useMessages();
  const { get, useQuery } = useApi();
  const { showToast } = useToasts();
  const { websitesUrl, websitesPath, settingsPath } = useContext(SettingsContext);
  const { data, isLoading } = useQuery({
    queryKey: ['website', websiteId],
    queryFn: () => get(`${websitesUrl}/${websiteId}`),
    enabled: !!websiteId,
    gcTime: 0,
  });
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState<Key>('details');

  const showSuccess = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleSave = (data: any) => {
    showSuccess();
    setValues((state: any) => ({ ...state, ...data }));
  };

  const handleReset = async (value: string) => {
    if (value === 'delete') {
      router.push(settingsPath);
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
    return <Loading position="page" />;
  }

  return (
    <>
      <PageHeader title={values?.name}>
        <Link href={`${websitesPath}/${websiteId}`} target={openExternal ? '_blank' : null}>
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
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} />}
      {tab === 'share' && <ShareUrl websiteId={websiteId} data={values} onSave={handleSave} />}
      {tab === 'data' && <WebsiteData websiteId={websiteId} onSave={handleReset} />}
    </>
  );
}

export default WebsiteSettings;
