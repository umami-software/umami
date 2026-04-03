import {
  Column,
  DataColumn,
  DataTable,
  type DataTableProps,
  Icon,
  Text,
  useTheme,
} from '@umami/react-zen';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { SquarePen } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { getThemeColors } from '@/lib/colors';
import { formatLongNumber } from '@/lib/format';

export interface WebsitesTableProps extends DataTableProps {
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
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
  ...props
}: WebsitesTableProps) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn
        id={showStats ? 'website' : 'name'}
        label={t(showStats ? labels.website : labels.name)}
      >
        {(row: any) => {
          if (!showStats) {
            return renderLink ? renderLink(row) : row.name;
          }

          return (
            <Column gap="1">
              {renderLink ? renderLink(row) : <Text>{row.name}</Text>}
              <Text size="sm" color="muted" truncate title={row.domain}>
                {row.domain}
              </Text>
            </Column>
          );
        }}
      </DataColumn>
      {!showStats && <DataColumn id="domain" label={t(labels.domain)} />}
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
        <DataColumn id="action" label=" " align="end">
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
