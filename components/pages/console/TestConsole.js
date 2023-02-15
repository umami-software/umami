import { Button, Column, Row, Dropdown, Item } from 'react-basics';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EventsChart from 'components/metrics/EventsChart';
import WebsiteChart from 'components/metrics/WebsiteChart';
import WebsiteSelect from 'components/input/WebsiteSelect';
import useApi from 'hooks/useApi';
import styles from './TestConsole.module.css';

export default function TestConsole() {
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['websites:me'], () => get('/me/websites'));
  const router = useRouter();
  const {
    basePath,
    query: { id },
  } = router;

  function handleChange(value) {
    router.push(`/console/${value}`);
  }

  function handleClick() {
    window.umami('umami-default');
    window.umami.trackView('/page-view', 'https://www.google.com');
    window.umami.trackEvent('track-event-no-data');
    window.umami.trackEvent('track-event-with-data', { test: 'test-data', time: Date.now() });
  }

  if (!data) {
    return null;
  }

  const websiteId = id?.[0];
  const website = data.find(({ id }) => websiteId === id);

  return (
    <Page loading={isLoading} error={error}>
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
      <PageHeader title="Test console">
        <WebsiteSelect websiteId={website?.id} onSelect={handleChange} />
      </PageHeader>
      {website && (
        <>
          <Row className={styles.test}>
            <Column xs="4">
              <div className={styles.header}>Page links</div>
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
              <div className={styles.header}>CSS events</div>
              <Button id="primary-button" className="umami--click--button-click" variant="action">
                Send event
              </Button>
            </Column>
            <Column xs="4">
              <div className={styles.header}>Javascript events</div>
              <Button id="manual-button" variant="action" onClick={handleClick}>
                Run script
              </Button>
            </Column>
          </Row>
          <Row>
            <Column>
              <div className={styles.header}>Statistics</div>
              <WebsiteChart
                websiteId={website.id}
                title={website.name}
                domain={website.domain}
                showLink
              />
              <div className={styles.header}>Events</div>
              <EventsChart websiteId={website.id} />
            </Column>
          </Row>
        </>
      )}
    </Page>
  );
}
