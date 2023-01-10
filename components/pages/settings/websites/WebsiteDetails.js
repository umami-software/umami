import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast, Button, Icon } from 'react-basics';
import useApi from 'hooks/useApi';
import Link from 'next/link';
import Page from 'components/layout/Page';
import WebsiteEditForm from 'components/pages/settings/websites/WebsiteEditForm';
import WebsiteReset from 'components/pages/settings/websites/WebsiteReset';
import PageHeader from 'components/layout/PageHeader';
import TrackingCode from 'components/pages/settings/websites/TrackingCode';
import ShareUrl from 'components/pages/settings/websites/ShareUrl';
import ExternalLink from 'assets/external-link.svg';

export default function WebsiteDetails({ websiteId }) {
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
    showToast({ message: 'Saved successfully.', variant: 'success' });
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
            <Link href="/settings/websites">Websites</Link>
          </Item>
          <Item>{values?.name}</Item>
        </Breadcrumbs>
        <Link href={`/analytics/websites/${websiteId}`}>
          <a target="_blank">
            <Button variant="primary">
              <Icon>
                <ExternalLink />
              </Icon>
              View
            </Button>
          </a>
        </Link>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="details">Details</Item>
        <Item key="tracking">Tracking code</Item>
        <Item key="share">Share URL</Item>
        <Item key="actions">Actions</Item>
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
