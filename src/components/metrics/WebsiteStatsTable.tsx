'use client';
import { Column, Icon, Loading, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { Favicon } from '@/components/common/Favicon';
import { useMessages, useNavigation } from '@/components/hooks';
import { SparkLine } from './SparkLine';

export interface WebsiteStatsRow {
  id: string;
  name: string;
  domain: string;
  stats: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
  series?: number[];
}

export function WebsiteStatsTable({
  websites,
  isLoading,
}: {
  websites: WebsiteStatsRow[];
  isLoading?: boolean;
}) {
  const { t, labels } = useMessages();
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
        <Text style={{ flex: 2 }}>{t(labels.name)}</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{t(labels.visitors)}</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{t(labels.views)}</Text>
        <Text style={{ width: 100, textAlign: 'center' }}>&nbsp;</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{t(labels.bounceRate)}</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{t(labels.visitDuration)}</Text>
      </Row>
      {websites.map(({ id, name, domain, stats, series }) => {
        const bounceRate = stats?.visits > 0 ? Math.round((stats.bounces / stats.visits) * 100) : 0;
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
            <Link
              href={renderUrl(`/websites/${id}`)}
              style={{ flex: 2, textDecoration: 'none', color: 'inherit' }}
            >
              <Row alignItems="center" gap="3">
                <Icon size="md" color="muted">
                  <Favicon domain={domain} />
                </Icon>
                <Column>
                  <Text>{name}</Text>
                  <Text size="xs" color="muted">
                    {domain}
                  </Text>
                </Column>
              </Row>
            </Link>
            <Text style={{ flex: 1, textAlign: 'right' }}>
              {stats?.visitors?.toLocaleString() || '0'}
            </Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>
              {stats?.pageviews?.toLocaleString() || '0'}
            </Text>
            <Row style={{ width: 100 }} justifyContent="center">
              {series && series.length > 1 && <SparkLine data={series} width={80} height={24} />}
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
