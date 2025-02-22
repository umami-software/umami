import { useLocale, useMessages, useTeamUrl } from '@/components/hooks';
import useDashboard from '@/store/dashboard';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button, Icon, Icons, Text } from 'react-basics';
import { firstBy } from 'thenby';
import WebsiteChart from './WebsiteChart';
import WebsiteHeader from './WebsiteHeader';
import WebsiteMetrics from './WebsiteMetrics';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';

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
  const { websiteOrder, websiteActive } = useDashboard();
  const { renderTeamUrl } = useTeamUrl();
  const { dir } = useLocale();

  const ordered = useMemo(() => {
    return websites
      .filter(website => (websiteActive.length ? websiteActive.includes(website.id) : true))
      .map(website => ({ ...website, order: websiteOrder.indexOf(website.id) || 0 }))
      .sort(firstBy('order'));
  }, [websites, websiteOrder, websiteActive]);

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
            <WebsiteMetrics websiteId={id}>
              <WebsiteMetricsBar websiteId={id} showChange={true} />
            </WebsiteMetrics>
            {showCharts && <WebsiteChart websiteId={id} />}
          </div>
        ) : null;
      })}
    </div>
  );
}
