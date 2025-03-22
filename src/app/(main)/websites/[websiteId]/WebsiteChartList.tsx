import { Text, Icon, Icons } from '@umami/react-zen';
import { useMemo } from 'react';
import { firstBy } from 'thenby';
import { WebsiteChart } from './WebsiteChart';
import { useDashboard } from '@/store/dashboard';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { useMessages, useNavigation } from '@/components/hooks';
import { LinkButton } from '@/components/common/LinkButton';

export function WebsiteChartList({
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
  const { renderTeamUrl } = useNavigation();

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
              <LinkButton href={renderTeamUrl(`/websites/${id}`)} variant="primary">
                <Text>{formatMessage(labels.viewDetails)}</Text>
                <Icon>
                  <Icon>
                    <Icons.Arrow />
                  </Icon>
                </Icon>
              </LinkButton>
            </WebsiteHeader>
            <WebsiteMetricsBar websiteId={id} showChange={true} />
            {showCharts && <WebsiteChart websiteId={id} />}
          </div>
        ) : null;
      })}
    </div>
  );
}
