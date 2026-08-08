import {
  Column,
  DataColumn,
  DataTable,
  type DataTableProps,
  Icon,
  Text,
  useTheme,
} from '@umami/react-zen';
import { useMemo, type ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { LinkButton } from '@/components/common/LinkButton';
import { SortableLabel } from '@/components/common/SortableLabel';
import { useMessages, useNavigation, useWebsiteListChartsQuery } from '@/components/hooks';
import { SquarePen } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { getThemeColors } from '@/lib/colors';
import { decodePunycodeDomain, formatLongNumber } from '@/lib/format';
import { WebsiteSparkline } from './WebsiteSparkline';

export interface WebsitesTableProps extends DataTableProps {
  showActions?: boolean;
  showStats?: boolean;
  renderLink?: (row: any) => ReactNode;
}

function WebsiteMetric({
  label,
  value,
  formatValue = formatLongNumber,
}: {
  label: string;
  value?: number;
  formatValue?: (value: number) => string;
}) {
  return (
    <Column gap="1" alignItems="flex-end">
      <Text weight="bold">{formatValue(value || 0)}</Text>
      <Text size="sm" color="muted">
        {label}
      </Text>
    </Column>
  );
}

function WebsiteActivitySparkline({ values }: { values?: number[] }) {
  const { theme } = useTheme();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const series = Array.from({ length: 7 }, (_, index) => Number(values?.[index]) || 0);
  const width = 84;
  const height = 32;
  const barWidth = 8;
  const gap = 4;
  const maxValue = Math.max(...series, 1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      {series.map((value, index) => {
        const scaledHeight = value > 0 ? Math.max((value / maxValue) * height, 4) : 2;
        const x = index * (barWidth + gap);
        const y = height - scaledHeight;

        return (
          <rect
            key={`${value}-${index}`}
            x={x}
            y={y}
            width={barWidth}
            height={scaledHeight}
            rx="2"
            fill={colors.chart.views.borderColor}
          />
        );
      })}
    </svg>
  );
}

function WebsiteStatus({
  isActive,
  activeVisitors,
  activeLabel,
  inactiveLabel,
  onlineLabel,
}: {
  isActive?: boolean;
  activeVisitors?: number;
  activeLabel: string;
  inactiveLabel: string;
  onlineLabel: string;
}) {
  return (
    <Column gap="1" alignItems="flex-end">
      <Text
        weight="bold"
        style={{ color: isActive ? 'var(--status-success)' : 'var(--text-muted)' }}
      >
        {isActive ? activeLabel : inactiveLabel}
      </Text>
      <Text size="sm" color="muted">
        {activeVisitors ? `${formatLongNumber(activeVisitors)} ${onlineLabel}` : inactiveLabel}
      </Text>
    </Column>
  );
}

export function WebsitesTable({
  showActions,
  showStats,
  renderLink,
  data = [],
  ...props
}: WebsitesTableProps & { data?: any[] }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const websiteIds = useMemo(() => data.map(row => row.id), [data]);
  const chartsQuery = useWebsiteListChartsQuery(websiteIds);
  const charts = chartsQuery.data?.data || {};
  const isChartLoading = chartsQuery.isLoading && !chartsQuery.data;

  return (
    <DataTable {...props} data={data}>
      {showStats ? (
        <DataColumn
          id="website"
          label={t(labels.website)}
        >
          {(row: any) => (
            <Column gap="1">
              {renderLink ? renderLink(row) : <Text>{row.name}</Text>}
              <Text size="sm" color="muted" truncate title={decodePunycodeDomain(row.domain) ?? undefined}>
                {decodePunycodeDomain(row.domain)}
              </Text>
            </Column>
          )}
        </DataColumn>
      ) : (
        <DataColumn
          id="name"
          label={<SortableLabel label={t(labels.name)} sortKey="name" />}
          style={{ minWidth: 0 }}
        >
          {renderLink}
        </DataColumn>
      )}
      {!showStats && (
        <DataColumn
          id="domain"
          label={<SortableLabel label={t(labels.domain)} sortKey="domain" />}
          style={{ minWidth: 0 }}
        >
          {(row: any) => (
            <Text
              truncate
              title={decodePunycodeDomain(row.domain) ?? undefined}
              style={{ maxWidth: '100%' }}
            >
              {decodePunycodeDomain(row.domain)}
            </Text>
          )}
        </DataColumn>
      )}
      {!showStats && (
        <DataColumn
          id="chart"
          label={<span style={{ whiteSpace: 'normal' }}>{`${t(labels.visitors)} (7d)`}</span>}
          style={{ minWidth: 0 }}
        >
          {(row: any) => {
            const chart = charts[row.id];

            return (
              <WebsiteSparkline
                values={chart?.values}
                total={chart?.total}
                isLoading={isChartLoading}
              />
            );
          }}
        </DataColumn>
      )}
      {!showStats && (
        <DataColumn
          id="created"
          label={
            <SortableLabel label={t(labels.created)} sortKey="createdAt" defaultDirection="desc" />
          }
          width="180px"
        >
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
      )}
      {showStats && (
        <DataColumn id="visitors" label={t(labels.visitors)} align="end" width="160px">
          {(row: any) => <WebsiteMetric label={t(labels.today)} value={row.metrics?.visitors} />}
        </DataColumn>
      )}
      {showStats && (
        <DataColumn id="pageviews" label={t(labels.pageViews)} align="end" width="160px">
          {(row: any) => <WebsiteMetric label={t(labels.today)} value={row.metrics?.pageviews} />}
        </DataColumn>
      )}
      {showStats && (
        <DataColumn id="bounceRate" label={t(labels.bounceRate)} align="end" width="140px">
          {(row: any) => (
            <WebsiteMetric
              label={t(labels.today)}
              value={row.metrics?.bounceRate}
              formatValue={value => `${Math.round(value)}%`}
            />
          )}
        </DataColumn>
      )}
      {showStats && (
        <DataColumn id="change" label={t(labels.change)} align="end" width="140px">
          {(row: any) => (
            <ChangeLabel value={row.metrics?.change || 0}>
              {`${Math.round(Math.abs(row.metrics?.change || 0))}%`}
            </ChangeLabel>
          )}
        </DataColumn>
      )}
      {showStats && (
        <DataColumn id="activity" label={t(labels.lastDays, { x: 7 })} align="end" width="120px">
          {(row: any) => <WebsiteActivitySparkline values={row.metrics?.activity} />}
        </DataColumn>
      )}
      {showStats && (
        <DataColumn id="status" label={t(labels.status)} align="end" width="140px">
          {(row: any) => (
            <WebsiteStatus
              isActive={row.metrics?.isActive}
              activeVisitors={row.metrics?.activeVisitors}
              activeLabel={t(labels.active)}
              inactiveLabel={t(labels.inactive)}
              onlineLabel={t(labels.online)}
            />
          )}
        </DataColumn>
      )}
      {showActions && (
        <DataColumn id="action" label=" " align="end" width="48px">
          {(row: any) => {
            const websiteId = row.id;

            return (
              <LinkButton href={renderUrl(`/websites/${websiteId}/settings`)} variant="quiet">
                <Icon>
                  <SquarePen />
                </Icon>
              </LinkButton>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
