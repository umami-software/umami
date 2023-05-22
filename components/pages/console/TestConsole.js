import WebsiteSelect from 'components/input/WebsiteSelect';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EventsChart from 'components/metrics/EventsChart';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useApi from 'hooks/useApi';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { Button, Column, Row } from 'react-basics';
import styles from './TestConsole.module.css';

export function TestConsole() {
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
    window.umami.track({ url: '/page-view', referrer: 'https://www.google.com' });
    window.umami.track('track-event-no-data');
    window.umami.track('track-event-with-data', {
      data: {
        test: 'test-data',
        time: new Date(),
        number: 1,
        time2: new Date().toISOString(),
        nested: {
          test: 'test-data',
          number: 1,
          object: {
            test: 'test-data',
          },
        },
        array: [1, 2, 3],
      },
    });
  }

  if (!data) {
    return null;
  }

  const [websiteId] = id || [];
  const website = data.find(({ id }) => websiteId === id);

  return (
    <Page loading={isLoading} error={error}>
      <Head>
        <title>{website ? `${website.name} | Umami Console` : 'Umami Console'}</title>
      </Head>
      <PageHeader title="Test console">
        <WebsiteSelect websiteId={website?.id} onSelect={handleChange} />
      </PageHeader>
      {website && (
        <>
          <Script
            async
            data-website-id={website.id}
            src={`${basePath}/script.js`}
            data-cache="true"
          />
          <Row className={styles.test}>
            <Column xs="4">
              <div className={styles.header}>Page links</div>
              <div>
                <Link href={`/console/${websiteId}/page/1/?q=abc`}>page one</Link>
              </div>
              <div>
                <Link href={`/console/${websiteId}/page/2/?q=123 `}>page two</Link>
              </div>
              <div>
                <a href="https://www.google.com" data-umami-event="external-link-direct">
                  external link (direct)
                </a>
              </div>
              <div>
                <a
                  href="https://www.google.com"
                  data-umami-event="external-link-tab"
                  target="_blank"
                  rel="noreferrer"
                >
                  external link (tab)
                </a>
              </div>
            </Column>
            <Column xs="4">
              <div className={styles.header}>Click events</div>
              <Button id="send-event-button" data-umami-event="button-click" variant="action">
                Send event
              </Button>
              <p />
              <Button
                id="send-event-data-button"
                data-umami-event="button-click"
                data-umami-event-name="bob"
                data-umami-event-id="123"
                variant="action"
              >
                Send event with data
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
              <WebsiteChart
                websiteId={website.id}
                name={website.name}
                domain={website.domain}
                showLink
              />
              <EventsChart websiteId={website.id} />
            </Column>
          </Row>
        </>
      )}
    </Page>
  );
}

export default TestConsole;
