import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Head from 'next/head';
import Link from 'next/link';
import Page from '../layout/Page';
import PageHeader from '../layout/PageHeader';
import useFetch from '../../hooks/useFetch';
import DropDown from '../common/DropDown';
import styles from './TestConsole.module.css';
import WebsiteChart from '../metrics/WebsiteChart';
import EventsChart from '../metrics/EventsChart';
import Button from '../common/Button';
import EmptyPlaceholder from '../common/EmptyPlaceholder';

export default function TestConsole() {
  const user = useSelector(state => state.user);
  const [website, setWebsite] = useState();
  const { data } = useFetch('/api/websites');

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
          <script async defer data-website-id={website.website_uuid} src="/umami.js" />
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
            </div>
            <div className="col-4">
              <PageHeader>CSS events</PageHeader>
              <Button id="primary-button" className="umami--click--primary-button" variant="action">
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
