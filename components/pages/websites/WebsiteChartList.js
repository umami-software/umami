import { useMemo } from 'react';
import { firstBy } from 'thenby';
import WebsiteChart from 'components/metrics/WebsiteChart';
import useDashboard from 'store/dashboard';
import styles from './WebsiteList.module.css';

export default function WebsiteChartList({ websites, showCharts, limit }) {
  const { websiteOrder } = useDashboard();

  const ordered = useMemo(
    () =>
      websites
        .map(website => ({ ...website, order: websiteOrder.indexOf(website.id) || 0 }))
        .sort(firstBy('order')),
    [websites, websiteOrder],
  );

  return (
    <div>
      {ordered.map(({ id, name, domain }, index) => {
        return index < limit ? (
          <div key={id} className={styles.website}>
            <WebsiteChart
              websiteId={id}
              name={name}
              domain={domain}
              showChart={showCharts}
              showDetailsButton={true}
            />
          </div>
        ) : null;
      })}
    </div>
  );
}
