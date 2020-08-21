import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import WebsiteChart from 'components/metrics/WebsiteChart';
import RankingsChart from 'components/metrics/RankingsChart';
import WorldMap from 'components/common/WorldMap';
import Page from 'components/layout/Page';
import WebsiteHeader from 'components/metrics/WebsiteHeader';
import MenuLayout from 'components/layout/MenuLayout';
import Button from 'components/common/Button';
import { getDateRange } from 'lib/date';
import { get } from 'lib/web';
import { browserFilter, urlFilter, refFilter, deviceFilter, countryFilter } from 'lib/filters';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteDetails.module.css';

const pageviewClasses = 'col-md-12 col-lg-6';
const sessionClasses = 'col-md-12 col-lg-4';

export default function WebsiteDetails({ websiteId, defaultDateRange = '7day' }) {
  const [data, setData] = useState();
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange(defaultDateRange));
  const [expand, setExpand] = useState();
  const { startDate, endDate } = dateRange;

  const menuOptions = [
    {
      render: () => (
        <Button
          className={styles.backButton}
          icon={<Arrow />}
          size="xsmall"
          onClick={() => setExpand(null)}
        >
          <div>Back</div>
        </Button>
      ),
    },
    { label: 'Pages', value: 'url', filter: urlFilter },
    { label: 'Referrers', value: 'referrer', filter: refFilter(data?.domain) },
    { label: 'Browsers', value: 'browser', filter: browserFilter },
    { label: 'Operating system', value: 'os' },
    { label: 'Devices', value: 'device', filter: deviceFilter },
    {
      label: 'Countries',
      value: 'country',
      filter: countryFilter,
      onDataLoad: data => setCountryData(data),
    },
  ];

  async function loadData() {
    setData(await get(`/api/website/${websiteId}`));
  }

  function handleDataLoad() {
    if (!chartLoaded) setTimeout(() => setChartLoaded(true), 300);
  }

  function handleDateChange(values) {
    setTimeout(() => setDateRange(values), 300);
  }

  function handleExpand(value) {
    setExpand(menuOptions.find(e => e.value === value));
  }

  function handleMenuSelect(value) {
    setExpand(menuOptions.find(e => e.value === value));
  }

  function getHeading(type) {
    return type === 'url' || type === 'referrer' ? 'Views' : 'Visitors';
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
          <WebsiteHeader websiteId={websiteId} name={data.name} showLink={false} />
          <WebsiteChart
            websiteId={websiteId}
            onDataLoad={handleDataLoad}
            onDateChange={handleDateChange}
            stickyHeader
          />
        </div>
      </div>
      {chartLoaded && !expand && (
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
                limit={10}
                dataFilter={urlFilter}
                onExpand={handleExpand}
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
                limit={10}
                dataFilter={refFilter(data.domain)}
                onExpand={handleExpand}
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
                limit={10}
                dataFilter={browserFilter}
                onExpand={handleExpand}
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
                limit={10}
                onExpand={handleExpand}
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
                limit={10}
                dataFilter={deviceFilter}
                onExpand={handleExpand}
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
                limit={10}
                dataFilter={countryFilter}
                onDataLoad={data => setCountryData(data)}
                onExpand={handleExpand}
              />
            </div>
          </div>
        </>
      )}
      {expand && (
        <MenuLayout
          className={styles.expand}
          menuClassName={styles.menu}
          optionClassName={styles.option}
          menu={menuOptions}
          selectedOption={expand.value}
          onMenuSelect={handleMenuSelect}
        >
          <RankingsChart
            title={expand.label}
            type={expand.value}
            heading={getHeading(expand.value)}
            websiteId={websiteId}
            startDate={startDate}
            endDate={endDate}
            dataFilter={expand.filter}
            onDataLoad={expand.onDataLoad}
          />
        </MenuLayout>
      )}
    </Page>
  );
}
