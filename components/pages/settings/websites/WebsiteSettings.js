import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast, Button, Text, Icon, Icons } from 'react-basics';
import { defineMessages, useIntl } from 'react-intl';
import Link from 'next/link';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteEditForm from 'components/pages/settings/websites/WebsiteEditForm';
import WebsiteReset from 'components/pages/settings/websites/WebsiteReset';
import TrackingCode from 'components/pages/settings/websites/TrackingCode';
import ShareUrl from 'components/pages/settings/websites/ShareUrl';
import useApi from 'hooks/useApi';

const { External } = Icons;

const messages = defineMessages({
  websites: { id: 'label.websites', defaultMessage: 'Websites' },
  details: { id: 'label.details', defaultMessage: 'Details' },
  trackingCode: { id: 'label.tracking-code', defaultMessage: 'Tracking code' },
  shareUrl: { id: 'label.share-url', defaultMessage: 'Share URL' },
  actions: { id: 'label.actions', defaultMessage: 'Actions' },
  view: { id: 'label.view', defaultMessage: 'View' },
  saved: { id: 'message.saved-successfully', defaultMessage: 'Save successfully.' },
});

export default function WebsiteSettings({ websiteId }) {
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

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  return (
    <Page loading={isLoading || !values}>
      {toast}
      <PageHeader>
        <Breadcrumbs>
          <Item>
            <Link href="/settings/websites">{formatMessage(messages.websites)}</Link>
          </Item>
          <Item>{values?.name}</Item>
        </Breadcrumbs>
        <Link href={`/websites/${websiteId}`}>
          <a>
            <Button variant="primary">
              <Icon>
                <External />
              </Icon>
              <Text>{formatMessage(messages.view)}</Text>
            </Button>
          </a>
        </Link>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(messages.details)}</Item>
        <Item key="tracking">{formatMessage(messages.trackingCode)}</Item>
        <Item key="share">{formatMessage(messages.shareUrl)}</Item>
        <Item key="actions">{formatMessage(messages.actions)}</Item>
      </Tabs>
      {tab === 'details' && (
        <WebsiteEditForm websiteId={websiteId} data={values} onSave={handleSave} />
      )}
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} data={values} />}
      {tab === 'share' && <ShareUrl websiteId={websiteId} data={values} onSave={handleSave} />}
      {tab === 'actions' && <WebsiteReset websiteId={websiteId} onSave={handleSave} />}
    </Page>
  );
}
