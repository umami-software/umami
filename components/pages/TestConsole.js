import React, { useState } from 'react';
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
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Icon from 'components/common/Icon';
import useFetch from 'hooks/useFetch';
import useUser from 'hooks/useUser';
import ChevronDown from 'assets/chevron-down.svg';
import styles from './TestConsole.module.css';

export default function TestConsole() {
  const { user } = useUser();
  const [website, setWebsite] = useState();
  const [show, setShow] = useState(true);
  const { basePath } = useRouter();
  const { data } = useFetch('/websites');

  if (!data || !user?.is_admin) {
    return null;
  }

  const options = data.map(({ name, website_id }) => ({ label: name, value: website_id }));
  const selectedValue = options.find(({ value }) => value === website?.website_id)?.value;

  function handleSelect(value) {
    setWebsite(data.find(({ website_id }) => website_id === value));
  }

  function handleClick() {
    window.umami('event (default)');
    window.umami.trackView('/page-view', 'https://www.google.com');
    window.umami.trackEvent('event (custom)', 'custom-type');
  }

  return (
    <Page>
      <Head>
        {typeof window !== 'undefined' && website && (
          <script
            async
            defer
            data-website-id={website.website_uuid}
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
      {!selectedValue && <EmptyPlaceholder msg="I hope you know what you're doing here" />}
      {selectedValue && (
        <>
          <div>
            <Icon
              icon={<ChevronDown />}
              className={classNames({ [styles.hidden]: !show })}
              onClick={() => setShow(!show)}
            />
          </div>
          {show && (
            <div className={classNames(styles.test, 'row')}>
              <div className="col-4">
                <PageHeader>Page links</PageHeader>
                <div>
                  <Link href={`?page=1`}>
                    <a>page one</a>
                  </Link>
                </div>
                <div>
                  <Link href={`?page=2`}>
                    <a>page two</a>
                  </Link>
                </div>
                <div>
                  <Link href={`https://www.google.com`}>
                    <a className="umami--click--external-link">external link</a>
                  </Link>
                </div>
              </div>
              <div className="col-4">
                <PageHeader>CSS events</PageHeader>
                <Button
                  id="primary-button"
                  className="umami--click--primary-button"
                  variant="action"
                >
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
          )}
          <div className="row">
            <div className="col-12">
              <WebsiteChart
                websiteId={website.website_id}
                title={website.name}
                domain={website.domain}
                showLink
              />
              <PageHeader>Events</PageHeader>
              <EventsChart websiteId={website.website_id} />
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
