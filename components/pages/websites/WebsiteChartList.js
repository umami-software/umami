import WebsiteChart from 'components/metrics/WebsiteChart';
import styles from './WebsiteList.module.css';
import useDashboard from 'store/dashboard';
import { useMemo } from 'react';
import { firstBy } from 'thenby';

export default function WebsiteList({ websites, showCharts, limit }) {
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
      {ordered.map(({ id, name, domain }, index) =>
        index < limit ? (
          <div key={id} className={styles.website}>
            <WebsiteChart
              websiteId={id}
              title={name}
              domain={domain}
              showChart={showCharts}
              showLink
            />
          </div>
        ) : null,
      )}
    </div>
  );
}
