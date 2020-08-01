import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { get } from 'lib/web';
import WebsiteChart from './WebsiteChart';
import RankingsChart from './RankingsChart';
import { getDateRange } from '../lib/date';
import styles from './WebsiteDetails.module.css';

const pageviewClasses = 'col-md-12 col-lg-6';
const sessionClasses = 'col-12 col-lg-4';

const urlFilter = data => data.filter(({ x }) => x !== '' && !x.startsWith('#'));

const refFilter = data =>
  data.filter(({ x }) => x !== '' && !x.startsWith('/') && !x.startsWith('#'));

const deviceFilter = data => {
  const devices = data.reduce(
    (obj, { x, y }) => {
      const [width] = x.split('x');
      if (width >= 1920) {
        obj.Desktop += +y;
      } else if (width >= 1024) {
        obj.Laptop += +y;
      } else if (width >= 767) {
        obj.Tablet += +y;
      } else {
        obj.Mobile += +y;
      }
      return obj;
    },
    { Desktop: 0, Laptop: 0, Tablet: 0, Mobile: 0 },
  );

  return Object.keys(devices).map(key => ({ x: key, y: devices[key] }));
};

const browsers = {
  aol: 'AOL',
  edge: 'Edge',
  'edge-ios': 'Edge (iOS)',
  yandexbrowser: 'Yandex',
  kakaotalk: 'KKaoTalk',
  samsung: 'Samsung',
  silk: 'Silk',
  miui: 'MIUI',
  beaker: 'Beaker',
  'edge-chromium': 'Edge (Chromium)',
  chrome: 'Chrome',
  'chromium-webview': 'Chrome (webview)',
  phantomjs: 'PhantomJS',
  crios: 'Chrome (iOS)',
  firefox: 'Firefox',
  fxios: 'Firefox (iOS)',
  'opera-mini': 'Opera Mini',
  opera: 'Opera',
  ie: 'IE',
  bb10: 'BlackBerry 10',
  android: 'Android',
  ios: 'iOS',
  safari: 'Safari',
  facebook: 'Facebook',
  instagram: 'Instagram',
  'ios-webview': 'iOS (webview)',
  searchbot: 'Searchbot',
};

const browserFilter = data => data.map(({ x, y }) => ({ x: browsers[x] || x, y }));

export default function WebsiteDetails({ websiteId, defaultDateRange = '7day' }) {
  const [data, setData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange(defaultDateRange));
  const { startDate, endDate } = dateRange;

  async function loadData() {
    setData(await get(`/api/website/${websiteId}`));
  }

  function handleDateChange(values) {
    setDateRange(values);
  }

  useEffect(() => {
    if (websiteId) {
      loadData();
    }
  }, [websiteId]);

  if (!data) {
    return <h1>loading...</h1>;
  }

  return (
    <>
      <div className="row">
        <div className={classNames(styles.chart, 'col')}>
          <h1>{data.label}</h1>
          <WebsiteChart websiteId={data.website_id} onDateChange={handleDateChange} />
        </div>
      </div>
      <div className={classNames(styles.row, 'row justify-content-between')}>
        <RankingsChart
          title="Top URLs"
          type="url"
          heading="Views"
          className={pageviewClasses}
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          dataFilter={urlFilter}
        />
        <RankingsChart
          title="Top referrers"
          type="referrer"
          heading="Views"
          className={pageviewClasses}
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          dataFilter={refFilter}
        />
      </div>
      <div className={classNames(styles.row, 'row justify-content-between')}>
        <RankingsChart
          title="Browsers"
          type="browser"
          heading="Visitors"
          className={sessionClasses}
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          dataFilter={browserFilter}
        />
        <RankingsChart
          title="Operating system"
          type="os"
          heading="Visitors"
          className={sessionClasses}
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
        />
        <RankingsChart
          title="Devices"
          type="screen"
          heading="Visitors"
          className={sessionClasses}
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          dataFilter={deviceFilter}
        />
      </div>
    </>
  );
}
