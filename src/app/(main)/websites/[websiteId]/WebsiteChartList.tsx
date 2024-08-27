import { Button, Text, Icon, Icons } from 'react-basics';
import { useMemo } from 'react';
import { firstBy } from 'thenby';
import Link from 'next/link';
import WebsiteChart from './WebsiteChart';
import useDashboard from 'store/dashboard';
import WebsiteHeader from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { useMessages, useLocale, useTeamUrl } from 'components/hooks';

export default function WebsiteChartList({
  websites,
  showCharts,
  limit,
}: {
  websites: any[];
  showCharts?: boolean;
  limit?: number;
}) {
  const { formatMessage, labels } = useMessages();
  const { websiteOrder } = useDashboard();
  const { renderTeamUrl } = useTeamUrl();
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
          <div key={id}>
            <WebsiteHeader websiteId={id} showLinks={false}>
              <Link href={renderTeamUrl(`/websites/${id}`)}>
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
            <WebsiteMetricsBar websiteId={id} showChange={true} />
            {showCharts && <WebsiteChart websiteId={id} />}
          </div>
        ) : null;
      })}
    </div>
  );
}
