import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast, Button, Icon } from 'react-basics';
import { useQuery } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import Link from 'next/link';
import Page from 'components/layout/Page';
import WebsiteEditForm from 'components/forms/WebsiteEditForm';
import WebsiteReset from 'components/forms/WebsiteReset';
import PageHeader from 'components/layout/PageHeader';
import TrackingCodeForm from 'components/forms/TrackingCodeForm';
import ShareUrlForm from 'components/forms/ShareUrlForm';
import ExternalLink from 'assets/external-link.svg';

export default function Websites({ websiteId }) {
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');
  const { get } = useApi();
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
            <Link href="/websites">Websites</Link>
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
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="details">General</Item>
        <Item key="tracking">Tracking code</Item>
        <Item key="share">Share URL</Item>
        <Item key="danger">Danger zone</Item>
      </Tabs>
      {tab === 'details' && (
        <WebsiteEditForm websiteId={websiteId} data={values} onSave={handleSave} />
      )}
      {tab === 'tracking' && <TrackingCodeForm websiteId={websiteId} data={values} />}
      {tab === 'share' && <ShareUrlForm websiteId={websiteId} data={values} onSave={handleSave} />}
      {tab === 'danger' && <WebsiteReset websiteId={websiteId} onSave={handleSave} />}
    </Page>
  );
}
