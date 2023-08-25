import { Button, Text, Icon } from 'react-basics';
import { useMemo } from 'react';
import { firstBy } from 'thenby';
import Link from 'next/link';
import WebsiteChart from 'components/pages/websites/WebsiteChart';
import useDashboard from 'store/dashboard';
import styles from './WebsiteList.module.css';
import WebsiteHeader from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { useMessages, useLocale } from 'components/hooks';
import Icons from 'components/icons';

export default function WebsiteChartList({ websites, showCharts, limit }) {
  const { formatMessage, labels } = useMessages();
  const { websiteOrder } = useDashboard();
  const { dir } = useLocale();

  const ordered = useMemo(
    () =>
      websites
        .map(website => ({ ...website, order: websiteOrder.indexOf(website.id) || 0 }))
        .sort(firstBy('order')),
    [websites, websiteOrder],
  );

  return (
    <div>
      {ordered.map(({ id }, index) => {
        return index < limit ? (
          <div key={id} className={styles.website}>
            <WebsiteHeader websiteId={id} showLinks={false}>
              <Link href={`/websites/${id}`}>
                <Button variant="primary">
                  <Text>{formatMessage(labels.viewDetails)}</Text>
                  <Icon>
                    <Icon rotate={dir === 'rtl' ? 180 : 0}>
                      <Icons.ArrowRight />
                    </Icon>
                  </Icon>
                </Button>
              </Link>
            </WebsiteHeader>
            <WebsiteMetricsBar websiteId={id} showFilter={false} />
            {showCharts && <WebsiteChart websiteId={id} />}
          </div>
        ) : null;
      })}
    </div>
  );
}
