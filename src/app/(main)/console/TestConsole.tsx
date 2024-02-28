import { Button } from 'react-basics';
import Link from 'next/link';
import Script from 'next/script';
import WebsiteSelect from 'components/input/WebsiteSelect';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EventsChart from 'components/metrics/EventsChart';
import WebsiteChart from '../websites/[websiteId]/WebsiteChart';
import { useApi, useNavigation } from 'components/hooks';
import styles from './TestConsole.module.css';

export function TestConsole({ websiteId }: { websiteId: string }) {
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery({
    queryKey: ['websites:me'],
    queryFn: () => get('/me/websites'),
  });
  const { router } = useNavigation();

  function handleChange(value: string) {
    router.push(`/console/${value}`);
  }

  function handleClick() {
    window['umami'].track({ url: '/page-view', referrer: 'https://www.google.com' });
    window['umami'].track('track-event-no-data');
    window['umami'].track('track-event-with-data', {
      test: 'test-data',
      boolean: true,
      booleanError: 'true',
      time: new Date(),
      number: 1,
      number2: Math.random() * 100,
      time2: new Date().toISOString(),
      nested: {
        test: 'test-data',
        number: 1,
        object: {
          test: 'test-data',
        },
      },
      array: [1, 2, 3],
    });
  }

  function handleIdentifyClick() {
    window['umami'].identify({
      userId: 123,
      name: 'brian',
      number: Math.random() * 100,
      test: 'test-data',
      boolean: true,
      booleanError: 'true',
      time: new Date(),
      time2: new Date().toISOString(),
      nested: {
        test: 'test-data',
        number: 1,
        object: {
          test: 'test-data',
        },
      },
      array: [1, 2, 3],
    });
  }

  if (!data) {
    return null;
  }

  const website = data?.data.find(({ id }) => websiteId === id);

  return (
    <Page isLoading={isLoading} error={error}>
      <PageHeader title="Test console">
        <WebsiteSelect websiteId={website?.id} onSelect={handleChange} />
      </PageHeader>
      {website && (
        <div className={styles.container}>
          <Script
            async
            data-website-id={websiteId}
            src={`${process.env.basePath}/script.js`}
            data-cache="true"
          />
          <div className={styles.actions}>
            <div className={styles.group}>
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
            </div>
            <div className={styles.group}>
              <div className={styles.header}>Click events</div>
              <Button id="send-event-button" data-umami-event="button-click" variant="primary">
                Send event
              </Button>
              <Button
                id="send-event-data-button"
                data-umami-event="button-click"
                data-umami-event-name="bob"
                data-umami-event-id="123"
                variant="primary"
              >
                Send event with data
              </Button>
              <Button
                id="button-with-div-button"
                data-umami-event="button-click"
                data-umami-event-name="bob"
                data-umami-event-id="123"
                variant="primary"
              >
                <div className={styles.wrapped}>Button with div</div>
              </Button>
              <div data-umami-event="div-click" className={styles.wrapped}>
                DIV with attribute
              </div>
              <div data-umami-event="div-click-one" className={styles.wrapped}>
                <div data-umami-event="div-click-two" className={styles.wrapped}>
                  <div data-umami-event="div-click-three" className={styles.wrapped}>
                    Nested DIV
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.group}>
              <div className={styles.header}>Javascript events</div>
              <Button id="manual-button" variant="primary" onClick={handleClick}>
                Run script
              </Button>
              <Button id="manual-button" variant="primary" onClick={handleIdentifyClick}>
                Run identify
              </Button>
            </div>
          </div>
          <WebsiteChart websiteId={website.id} />
          <EventsChart websiteId={website.id} />
        </div>
      )}
    </Page>
  );
}

export default TestConsole;
