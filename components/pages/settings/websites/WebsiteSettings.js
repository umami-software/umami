import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast, Button, Text, Icon, Icons } from 'react-basics';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteEditForm from 'components/pages/settings/websites/WebsiteEditForm';
import WebsiteData from 'components/pages/settings/websites/WebsiteData';
import TrackingCode from 'components/pages/settings/websites/TrackingCode';
import ShareUrl from 'components/pages/settings/websites/ShareUrl';
import useApi from 'hooks/useApi';
import { labels, messages } from 'components/messages';

export default function WebsiteSettings({ websiteId }) {
  const router = useRouter();
  const { formatMessage } = useIntl();
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');
  const { get, useQuery } = useApi();
  const { toast, showToast } = useToast();
  const { data, isLoading } = useQuery(
    ['website', websiteId],
    () => {
      if (websiteId) {
        return get(`/websites/${websiteId}`);
      }
    },
    { cacheTime: 0 },
  );

  const handleSave = data => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    setValues(state => ({ ...state, ...data }));
  };

  const handleReset = async value => {
    if (value === 'delete') {
      await router.push('/websites');
    }
  };

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  return (
    <Page loading={isLoading || !values}>
      {toast}
      <PageHeader
        title={
          <Breadcrumbs>
            <Item>
              <Link href="/settings/websites">{formatMessage(labels.websites)}</Link>
            </Item>
            <Item>{values?.name}</Item>
          </Breadcrumbs>
        }
      >
        <Link href={`/analytics/websites/${websiteId}`} target="_blank">
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
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} data={values} />}
      {tab === 'share' && <ShareUrl websiteId={websiteId} data={values} onSave={handleSave} />}
      {tab === 'data' && <WebsiteData websiteId={websiteId} onSave={handleReset} />}
    </Page>
  );
}
