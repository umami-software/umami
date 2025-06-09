import { ReactNode } from 'react';
import { Grid, Row, Column, Text, Loading, Icon } from '@umami/react-zen';
import { Empty } from '@/components/common/Empty';
import { Users } from '@/components/icons';
import { useMessages, useLocale, useResultQuery } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';
import { Panel } from '@/components/common/Panel';
import { LoadingPanel } from '@/components/common/LoadingPanel';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];

export interface RetentionProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  days?: number[];
}

export function Retention({ websiteId, days = DAYS, startDate, endDate }: RetentionProps) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { data, error, isLoading } = useResultQuery<any>('retention', {
    websiteId,
    dateRange: {
      startDate,
      endDate,
    },
  });

  if (isLoading) {
    return <Loading position="page" />;
  }

  if (!data) {
    return <Empty />;
  }

  const rows = data.reduce((arr: any[], row: { date: any; visitors: any; day: any }) => {
    const { date, visitors, day } = row;
    if (day === 0) {
      return arr.concat({
        date,
        visitors,
        records: days
          .reduce((arr, day) => {
            arr[day] = data.find(x => x.date === date && x.day === day);
            return arr;
          }, [])
          .filter(n => n),
      });
    }
    return arr;
  }, []);

  const totalDays = rows.length;

  return (
    <LoadingPanel isEmpty={!data?.length} isLoading={isLoading} error={error}>
      <Panel allowFullscreen height="900px">
        <Column gap="1" width="100%" overflow="auto">
          <Grid
            columns="120px repeat(10, 100px)"
            alignItems="center"
            gap="1"
            height="50px"
            autoFlow="column"
          >
            <Column>
              <Text weight="bold">{formatMessage(labels.cohort)}</Text>
            </Column>
            {days.map(n => (
              <Column key={n}>
                <Text weight="bold" align="center" wrap="nowrap">
                  {formatMessage(labels.day)} {n}
                </Text>
              </Column>
            ))}
          </Grid>
          {rows.map(({ date, visitors, records }: any, rowIndex: number) => {
            return (
              <Grid key={rowIndex} columns="120px repeat(10, 100px)" gap="1" autoFlow="column">
                <Column justifyContent="center" gap="1">
                  <Text weight="bold">{formatDate(date, 'PP', locale)}</Text>
                  <Row alignItems="center" gap>
                    <Icon>
                      <Users />
                    </Icon>
                    <Text>{formatLongNumber(visitors)}</Text>
                  </Row>
                </Column>
                {days.map(day => {
                  if (totalDays - rowIndex < day) {
                    return null;
                  }
                  const percentage = records.filter(a => a.day === day)[0]?.percentage;
                  return (
                    <Cell key={day}>{percentage ? `${Number(percentage).toFixed(2)}%` : ''}</Cell>
                  );
                })}
              </Grid>
            );
          })}
        </Column>
      </Panel>
    </LoadingPanel>
  );
}

const Cell = ({ children }: { children: ReactNode }) => {
  return (
    <Column
      justifyContent="center"
      alignItems="center"
      width="100px"
      height="100px"
      backgroundColor="2"
      borderRadius
    >
      {children}
    </Column>
  );
};
