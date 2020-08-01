import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import WebsiteChart from './WebsiteChart';
import RankingsChart from './RankingsChart';
import WorldMap from './WorldMap';
import { getDateRange } from 'lib/date';
import { get } from 'lib/web';
import { browserFilter, urlFilter, refFilter, deviceFilter, countryFilter } from 'lib/filters';
import styles from './WebsiteDetails.module.css';

const pageviewClasses = 'col-md-12 col-lg-6';
const sessionClasses = 'col-12 col-lg-4';

export default function WebsiteDetails({ websiteId, defaultDateRange = '7day' }) {
  const [data, setData] = useState();
  const [countryData, setCountryData] = useState();
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
      <div className="row">
        <WorldMap data={countryData} className="col-12 col-md-12 col-lg-8" />
        <RankingsChart
          title="Countries"
          type="country"
          heading="Visitors"
          className="col-12 col-md-12 col-lg-4"
          websiteId={data.website_id}
          startDate={startDate}
          endDate={endDate}
          dataFilter={countryFilter}
          onDataLoad={data => setCountryData(data)}
        />
      </div>
    </>
  );
}
