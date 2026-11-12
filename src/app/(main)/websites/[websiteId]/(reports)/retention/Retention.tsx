import { Column, Grid, Icon, Row, Text } from '@umami/react-zen';
import { differenceInCalendarDays } from 'date-fns';
import type { ReactNode } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useLocale, useMessages, useRetentionQuery } from '@/components/hooks';
import { Users } from '@/components/icons';
import { formatDate, parseBackendDate } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];

export interface RetentionProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  days?: number[];
}

export function Retention({ websiteId, days = DAYS, startDate, endDate }: RetentionProps) {
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const { data, error, isLoading } = useRetentionQuery({
    websiteId,
    startDate,
    endDate,
  });

  const rows =
    data?.reduce((arr: any[], row: { date: any; visitors: any; day: any }) => {
      const { date, visitors, day } = row;
      if (day === 0) {
        return arr.concat({
          date,
          visitors,
          records: days
            .reduce((arr, day) => {
              arr[day] = data.find(
                (x: { date: any; day: number }) => x.date === date && x.day === day,
              );
              return arr;
            }, [])
            .filter(n => n),
        });
      }
      return arr;
    }, []) || [];

  // No fixed scale fits every website, so shade relative to the best visible cell.
  const maxPercentage = Math.max(
    0,
    ...rows.flatMap(({ date, records }) => {
      const maxDay = differenceInCalendarDays(endDate, parseBackendDate(date));

      return records
        .filter(({ day }) => day <= maxDay)
        .map(({ percentage }) => Number(percentage) || 0);
    }),
  );

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Panel allowFullscreen height="900px">
          <Column
            paddingY="6"
            paddingX={{ base: '3', md: '6' }}
            position="absolute"
            top="40px"
            left="0"
            right="0"
            bottom="0"
          >
            <Column gap="1" overflow="auto">
              <Grid
                columns="120px repeat(10, 100px)"
                alignItems="center"
                gap="1"
                height="50px"
                width="max-content"
                minWidth="100%"
                autoFlow="column"
              >
                <Column>
                  <Text weight="bold" align="center">
                    {t(labels.cohort)}
                  </Text>
                </Column>
                {days.map(n => (
                  <Column key={n}>
                    <Text weight="bold" align="center" wrap="nowrap">
                      {t(labels.day)} {n}
                    </Text>
                  </Column>
                ))}
              </Grid>
              {rows.map(({ date, visitors, records }: any, rowIndex: number) => {
                const parsedDate = parseBackendDate(date);
                const maxDay = differenceInCalendarDays(endDate, parsedDate);
                return (
                  <Grid
                    key={rowIndex}
                    columns="120px repeat(10, 100px)"
                    gap="1"
                    autoFlow="column"
                    width="max-content"
                    minWidth="100%"
                  >
                    <Column justifyContent="center" gap="1">
                      <Text weight="bold">{formatDate(parsedDate, 'PP', locale)}</Text>
                      <Row alignItems="center" gap>
                        <Icon>
                          <Users />
                        </Icon>
                        <Text>{formatLongNumber(visitors)}</Text>
                      </Row>
                    </Column>
                    {days.map(day => {
                      if (day > maxDay) return null;
                      const percentage = records.find(a => a.day === day)?.percentage;
                      return (
                        <Cell
                          key={day}
                          // Square root keeps later days visible next to Day 1.
                          intensity={
                            percentage && maxPercentage
                              ? Math.sqrt(Number(percentage) / maxPercentage)
                              : 0
                          }
                        >
                          {percentage ? `${Number(percentage).toFixed(2)}%` : ''}
                        </Cell>
                      );
                    })}
                  </Grid>
                );
              })}
            </Column>
          </Column>
        </Panel>
      )}
    </LoadingPanel>
  );
}

const Cell = ({ intensity = 0, children }: { intensity?: number; children: ReactNode }) => {
  // Capped at 60% so the normal text color stays readable.
  const style = intensity
    ? {
        backgroundColor: `color-mix(in srgb, var(--zen-primary) ${Math.round(intensity * 60)}%, var(--zen-surface-raised))`,
      }
    : undefined;

  return (
    <Column
      justifyContent="center"
      alignItems="center"
      width="100px"
      height="100px"
      backgroundColor="surface-raised"
      borderRadius
      style={style}
    >
      {children}
    </Column>
  );
};
