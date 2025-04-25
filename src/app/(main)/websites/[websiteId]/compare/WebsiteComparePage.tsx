'use client';
import { useNavigation } from '@/components/hooks';
import FilterTags from '@/components/metrics/FilterTags';
import { FILTER_COLUMNS } from '@/lib/constants';
import WebsiteChart from '../WebsiteChart';
import WebsiteHeader from '../WebsiteHeader';
import WebsiteMetrics from '../WebsiteMetrics';
import WebsiteMetricsBar from '../WebsiteMetricsBar';
import WebsiteCompareTables from './WebsiteCompareTables';

export function WebsiteComparePage({ websiteId }) {
  const { query } = useNavigation();

  const params = Object.keys(query).reduce((obj, key) => {
    if (FILTER_COLUMNS[key]) {
      obj[key] = query[key];
    }
    return obj;
  }, {});

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <FilterTags websiteId={websiteId} params={params} />
      <WebsiteMetrics websiteId={websiteId} compareMode={true} showFilter={true}>
        <WebsiteMetricsBar websiteId={websiteId} compareMode={true} />
      </WebsiteMetrics>
      <WebsiteChart websiteId={websiteId} compareMode={true} />
      <WebsiteCompareTables websiteId={websiteId} />
    </>
  );
}

export default WebsiteComparePage;
