import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import WebsiteChart from './WebsiteChart';
import RankingsChart from './RankingsChart';
import WorldMap from './WorldMap';
import Page from './Page';
import { getDateRange } from 'lib/date';
import { get } from 'lib/web';
import { browserFilter, urlFilter, refFilter, deviceFilter, countryFilter } from 'lib/filters';
import styles from './WebsiteDetails.module.css';

const pageviewClasses = 'col-md-12 col-lg-6';
const sessionClasses = 'col-12 col-lg-4';

export default function WebsiteDetails({ websiteId, defaultDateRange = '7day' }) {
  const [data, setData] = useState();
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange(defaultDateRange));
  const { startDate, endDate } = dateRange;

  async function loadData() {
    setData(await get(`/api/website/${websiteId}`));
  }

  function handleDataLoad() {
    if (!chartLoaded) setTimeout(() => setChartLoaded(true), 300);
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
    <Page>
      <div className="row">
        <div className={classNames(styles.chart, 'col')}>
          <h2>{data.label}</h2>
          <WebsiteChart
            websiteId={websiteId}
            onDataLoad={handleDataLoad}
            onDateChange={handleDateChange}
            stickyHeader
          />
        </div>
      </div>
      {chartLoaded && (
        <>
          <div className={classNames(styles.row, 'row')}>
            <div className={pageviewClasses}>
              <RankingsChart
                title="Pages"
                type="url"
                heading="Views"
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dataFilter={urlFilter}
              />
            </div>
            <div className={pageviewClasses}>
              <RankingsChart
                title="Referrers"
                type="referrer"
                heading="Views"
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dataFilter={refFilter}
              />
            </div>
          </div>
          <div className={classNames(styles.row, 'row')}>
            <div className={sessionClasses}>
              <RankingsChart
                title="Browsers"
                type="browser"
                heading="Visitors"
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dataFilter={browserFilter}
              />
            </div>
            <div className={sessionClasses}>
              <RankingsChart
                title="Operating system"
                type="os"
                heading="Visitors"
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className={sessionClasses}>
              <RankingsChart
                title="Devices"
                type="device"
                heading="Visitors"
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dataFilter={deviceFilter}
              />
            </div>
          </div>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-12 col-md-12 col-lg-8">
              <WorldMap data={countryData} />
            </div>
            <div className="col-12 col-md-12 col-lg-4">
              <RankingsChart
                title="Countries"
                type="country"
                heading="Visitors"
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dataFilter={countryFilter}
                onDataLoad={data => setCountryData(data)}
              />
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
