import classNames from 'classnames';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import DropDown from 'components/common/DropDown';
import WebsiteChart from 'components/metrics/WebsiteChart';
import EventsChart from 'components/metrics/EventsChart';
import Button from 'components/common/Button';
import useFetch from 'hooks/useFetch';
import styles from './TestConsole.module.css';

export default function TestConsole() {
  const { data } = useFetch('/websites');
  const router = useRouter();
  const {
    basePath,
    query: { id },
  } = router;
  const websiteId = id?.[0];

  if (!data) {
    return null;
  }

  const options = data.map(({ name, websiteUuid }) => ({ label: name, value: websiteUuid }));
  const website = data.find(({ websiteUuid }) => websiteId === websiteUuid);
  const selectedValue = options.find(({ value }) => value === website?.websiteUuid)?.value;

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
            data-website-id={website.websiteUuid}
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
          <div className={classNames(styles.test, 'row')}>
            <div className="col-4">
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
            </div>
            <div className="col-4">
              <PageHeader>CSS events</PageHeader>
              <Button id="primary-button" className="umami--click--button-click" variant="action">
                Send event
              </Button>
            </div>
            <div className="col-4">
              <PageHeader>Javascript events</PageHeader>
              <Button id="manual-button" variant="action" onClick={handleClick}>
                Run script
              </Button>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <WebsiteChart
                websiteId={website.websiteUuid}
                title={website.name}
                domain={website.domain}
                showLink
              />
              <PageHeader>Events</PageHeader>
              <EventsChart websiteId={website.websiteUuid} />
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
