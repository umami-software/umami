'use client';
import { Column, DataColumn, DataTable, Text } from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/common/Badge';
import { DataGrid } from '@/components/common/DataGrid';
import { DateDistance } from '@/components/common/DateDistance';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useNavigation } from '@/components/hooks/useNavigation';
import { WebsiteControls } from '../WebsiteControls';
import { ErrorFilters, ErrorStats, useErrorFilters, useErrorQuery } from './ErrorShared';

export function ErrorsPage({ websiteId }: { websiteId: string }) {
  const t = useTranslations('errorTracking');
  const filters = useErrorFilters();
  const issues = useErrorQuery(websiteId, '', filters);
  const stats = useErrorQuery(websiteId, '/stats', filters);
  const { renderUrl } = useNavigation();

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowFilter={false} />
      <LoadingPanel
        data={stats.data}
        isLoading={stats.isLoading}
        error={stats.error}
        minHeight="300px"
      >
        {stats.data && <ErrorStats data={stats.data} {...filters} />}
      </LoadingPanel>
      <Panel title={t('title')}>
        <ErrorFilters />
        <DataGrid query={issues} allowSearch searchWidth={280} autoFocus={false}>
          {({ data }) => (
            <DataTable data={data}>
              <DataColumn id="title" label={t('issue')} width="2fr">
                {row => (
                  <Link
                    href={renderUrl(`/websites/${websiteId}/errors/${row.id}`, {
                      page: undefined,
                      occurrence: undefined,
                      status: undefined,
                    })}
                  >
                    <Text weight="bold" style={{ overflowWrap: 'anywhere' }}>
                      {row.title}
                    </Text>
                  </Link>
                )}
              </DataColumn>
              <DataColumn id="status" label={t('status')}>
                {row => (
                  <Badge
                    variant={
                      row.status === 'resolved'
                        ? 'good'
                        : row.status === 'ignored'
                          ? 'gray'
                          : 'warning'
                    }
                  >
                    {t(row.status)}
                  </Badge>
                )}
              </DataColumn>
              <DataColumn id="occurrences" label={t('occurrences')} align="end">
                {row => row.occurrences.toLocaleString()}
              </DataColumn>
              <DataColumn id="visits" label={t('visits')} align="end">
                {row => row.visits.toLocaleString()}
              </DataColumn>
              <DataColumn id="firstSeen" label={t('firstSeen')}>
                {row => <DateDistance date={new Date(row.firstSeen)} />}
              </DataColumn>
              <DataColumn id="lastSeen" label={t('lastSeen')}>
                {row => <DateDistance date={new Date(row.lastSeen)} />}
              </DataColumn>
            </DataTable>
          )}
        </DataGrid>
      </Panel>
    </Column>
  );
}
