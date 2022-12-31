import { Button, Column, Loading, Row } from 'react-basics';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DropDown from 'components/common/DropDown';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EventsChart from 'components/metrics/EventsChart';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useApi from 'hooks/useApi';
import styles from './TestConsole.module.css';

export default function TestConsole() {
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['websites:test-console'], () =>
    get('/websites?include_all=true'),
  );
  const router = useRouter();
  const {
    basePath,
    query: { id },
  } = router;
  const websiteId = id?.[0];

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  const options = data.map(({ name, id }) => ({ label: name, value: id }));
  const website = data.find(({ id }) => websiteId === id);
  const selectedValue = options.find(({ value }) => value === website?.id)?.value;

  function handleSelect(value) {
    router.push(`/console/${value}`);
  }

  function handleClick() {
    window.umami('umami-default');
    window.umami.trackView('/page-view', 'https://www.google.com');
    window.umami.trackEvent('track-event-no-data');
    window.umami.trackEvent('track-event-with-data', { test: 'test-data', time: Date.now() });
  }

  return (
    <Page>
      <Head>
        {typeof window !== 'undefined' && website && (
          <script
            async
            defer
            data-website-id={website.id}
            src={`${basePath}/umami.js`}
            data-cache="true"
          />
        )}
      </Head>
      <PageHeader>
        <div>Test Console</div>
        <DropDown
          value={selectedValue || 'Select website'}
          options={options}
          onChange={handleSelect}
        />
      </PageHeader>
      {website && (
        <>
          <Row className={styles.test}>
            <Column xs="4">
              <PageHeader>Page links</PageHeader>
              <div>
                <Link href={`/console/${websiteId}?page=1`}>
                  <a>page one</a>
                </Link>
              </div>
              <div>
                <Link href={`/console/${websiteId}?page=2`}>
                  <a>page two</a>
                </Link>
              </div>
              <div>
                <Link href={`https://www.google.com`}>
                  <a className="umami--click--external-link-direct">external link (direct)</a>
                </Link>
              </div>
              <div>
                <Link href={`https://www.google.com`}>
                  <a className="umami--click--external-link-tab" target="_blank">
                    external link (tab)
                  </a>
                </Link>
              </div>
            </Column>
            <Column xs="4">
              <PageHeader>CSS events</PageHeader>
              <Button id="primary-button" className="umami--click--button-click" variant="action">
                Send event
              </Button>
            </Column>
            <Column xs="4">
              <PageHeader>Javascript events</PageHeader>
              <Button id="manual-button" variant="action" onClick={handleClick}>
                Run script
              </Button>
            </Column>
          </Row>
          <Row>
            <Column>
              <WebsiteChart
                websiteId={website.id}
                title={website.name}
                domain={website.domain}
                showLink
              />
              <PageHeader>Events</PageHeader>
              <EventsChart websiteId={website.id} />
            </Column>
          </Row>
        </>
      )}
    </Page>
  );
}
