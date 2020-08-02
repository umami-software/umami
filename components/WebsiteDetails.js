import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import WebsiteChart from './WebsiteChart';
import RankingsChart from './RankingsChart';
import WorldMap from './WorldMap';
import CheckVisible from './CheckVisible';
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
    setTimeout(() => setDateRange(values), 300);
  }

  useEffect(() => {
    if (websiteId) {
      loadData();
    }
  }, [websiteId]);

  if (!data) {
    return null;
  }

  return (
    <>
      <div className="row">
        <div className={classNames(styles.chart, 'col')}>
          <h1>{data.label}</h1>
          <CheckVisible>
            {visible => (
              <WebsiteChart
                websiteId={data.website_id}
                onDateChange={handleDateChange}
                animate={visible}
                stickHeader
              />
            )}
          </CheckVisible>
        </div>
      </div>
      <div className={classNames(styles.row, 'row')}>
        <div className={pageviewClasses}>
          <CheckVisible>
            {visible => (
              <RankingsChart
                title="Pages"
                type="url"
                heading="Views"
                websiteId={data.website_id}
                startDate={startDate}
                endDate={endDate}
                dataFilter={urlFilter}
                animate={visible}
              />
            )}
          </CheckVisible>
        </div>
        <div className={pageviewClasses}>
          <CheckVisible>
            {visible => (
              <RankingsChart
                title="Referrers"
                type="referrer"
                heading="Views"
                websiteId={data.website_id}
                startDate={startDate}
                endDate={endDate}
                dataFilter={refFilter}
                animate={visible}
              />
            )}
          </CheckVisible>
        </div>
      </div>
      <div className={classNames(styles.row, 'row')}>
        <div className={sessionClasses}>
          <CheckVisible>
            {visible => (
              <RankingsChart
                title="Browsers"
                type="browser"
                heading="Visitors"
                websiteId={data.website_id}
                startDate={startDate}
                endDate={endDate}
                dataFilter={browserFilter}
                animate={visible}
              />
            )}
          </CheckVisible>
        </div>
        <div className={sessionClasses}>
          <CheckVisible>
            {visible => (
              <RankingsChart
                title="Operating system"
                type="os"
                heading="Visitors"
                websiteId={data.website_id}
                startDate={startDate}
                endDate={endDate}
                animate={visible}
              />
            )}
          </CheckVisible>
        </div>
        <div className={sessionClasses}>
          <CheckVisible>
            {visible => (
              <RankingsChart
                title="Devices"
                type="screen"
                heading="Visitors"
                websiteId={data.website_id}
                startDate={startDate}
                endDate={endDate}
                dataFilter={deviceFilter}
                animate={visible}
              />
            )}
          </CheckVisible>
        </div>
      </div>
      <div className={classNames(styles.row, 'row')}>
        <div className="col-12 col-md-12 col-lg-8">
          <WorldMap data={countryData} />
        </div>
        <div className="col-12 col-md-12 col-lg-4">
          <CheckVisible>
            {visible => (
              <RankingsChart
                title="Countries"
                type="country"
                heading="Visitors"
                websiteId={data.website_id}
                startDate={startDate}
                endDate={endDate}
                dataFilter={countryFilter}
                onDataLoad={data => setCountryData(data)}
                animate={visible}
              />
            )}
          </CheckVisible>
        </div>
      </div>
    </>
  );
}
