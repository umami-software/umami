import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { get } from 'lib/web';
import WebsiteChart from './WebsiteChart';
import RankingsChart from './RankingsChart';
import { getDateRange } from '../lib/date';
import styles from './WebsiteDetails.module.css';

const osFilter = data => data.map(({ x, y }) => ({ x: !x ? 'Unknown' : x, y }));

const urlFilter = data => data.filter(({ x }) => x !== '' && !x.startsWith('#'));

const refFilter = data =>
  data.filter(({ x }) => x !== '' && !x.startsWith('/') && !x.startsWith('#'));

const deviceFilter = data => {
  const devices = data.reduce(
    (obj, { x, y }) => {
      const [width] = x.split('x');
      if (width >= 1920) {
        obj.desktop += +y;
      } else if (width >= 1024) {
        obj.laptop += +y;
      } else if (width >= 767) {
        obj.tablet += +y;
      } else {
        obj.mobile += +y;
      }
      return obj;
    },
    { desktop: 0, laptop: 0, tablet: 0, mobile: 0 },
  );

  return Object.keys(devices).map(key => ({ x: key, y: devices[key] }));
};

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
        <div className="col">
          <h1>{data.label}</h1>
          <WebsiteChart websiteId={data.website_id} onDateChange={handleDateChange} />
        </div>
      </div>
      <div className={classNames(styles.row, 'row justify-content-between')}>
        <RankingsChart
          title="Top URLs"
          type="url"
          className="col-12 col-md-8 col-lg-6"
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          filterData={urlFilter}
        />
        <RankingsChart
          title="Top referrers"
          type="referrer"
          className="col-12 col-md-8 col-lg-6"
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          filterData={refFilter}
        />
      </div>
      <div className={classNames(styles.row, 'row justify-content-between')}>
        <RankingsChart
          title="Browsers"
          type="browser"
          className="col-12 col-md-8 col-lg-4"
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
        />
        <RankingsChart
          title="Operating system"
          type="os"
          className="col-12 col-md-8 col-lg-4"
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          filterData={osFilter}
        />
        <RankingsChart
          title="Devices"
          type="screen"
          className="col-12 col-md-8 col-lg-4"
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          filterData={deviceFilter}
        />
      </div>
    </>
  );
}
