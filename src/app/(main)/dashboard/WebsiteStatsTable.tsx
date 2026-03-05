'use client';
import { Column, Icon, Loading, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { Favicon } from '@/components/common/Favicon';
import { useMessages, useNavigation } from '@/components/hooks';
import { SparkLine } from './SparkLine';
import type { WebsiteWithStats } from './DashboardView';

export function WebsiteStatsTable({
  websites,
  isLoading,
}: {
  websites: WebsiteWithStats[];
  isLoading?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  if (isLoading) {
    return <Loading />;
  }

  if (!websites.length) {
    return <Text color="muted">No data available.</Text>;
  }

  return (
    <Column gap="0">
      <Row
        paddingY="3"
        paddingX="4"
        gap="4"
        style={{
          borderBottom: '1px solid var(--base300)',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}
      >
        <Text style={{ flex: 2 }}>{formatMessage(labels.name)}</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{formatMessage(labels.visitors)}</Text>
        <Text style={{ width: 100, textAlign: 'center' }}>&nbsp;</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{formatMessage(labels.views)}</Text>
        <Text style={{ width: 100, textAlign: 'center' }}>&nbsp;</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{formatMessage(labels.bounceRate)}</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{formatMessage(labels.visitDuration)}</Text>
      </Row>
      {websites.map(({ id, name, domain, stats, visitorSeries, pageviewSeries }) => {
        const bounceRate =
          stats?.visits > 0 ? Math.round((stats.bounces / stats.visits) * 100) : 0;
        const avgDuration = stats?.visits > 0 ? Math.round(stats.totaltime / stats.visits) : 0;

        return (
          <Row
            key={id}
            paddingY="3"
            paddingX="4"
            gap="4"
            alignItems="center"
            style={{
              borderBottom: '1px solid var(--base200)',
              fontSize: '0.875rem',
            }}
          >
            <Link href={renderUrl(`/websites/${id}`)} style={{ flex: 2, textDecoration: 'none', color: 'inherit' }}>
              <Row alignItems="center" gap="3">
                <Icon size="md" color="muted">
                  <Favicon domain={domain} />
                </Icon>
                <Column>
                  <Text>{name}</Text>
                  <Text size="1" color="muted">
                    {domain}
                  </Text>
                </Column>
              </Row>
            </Link>
            <Text style={{ flex: 1, textAlign: 'right' }}>
              {stats?.visitors?.toLocaleString() || '0'}
            </Text>
            <Row style={{ width: 100 }} justifyContent="center">
              {visitorSeries && visitorSeries.length > 1 && (
                <SparkLine data={visitorSeries} width={80} height={24} />
              )}
            </Row>
            <Text style={{ flex: 1, textAlign: 'right' }}>
              {stats?.pageviews?.toLocaleString() || '0'}
            </Text>
            <Row style={{ width: 100 }} justifyContent="center">
              {pageviewSeries && pageviewSeries.length > 1 && (
                <SparkLine data={pageviewSeries} width={80} height={24} />
              )}
            </Row>
            <Text style={{ flex: 1, textAlign: 'right' }}>{bounceRate}%</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>{formatDuration(avgDuration)}</Text>
          </Row>
        );
      })}
    </Column>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
