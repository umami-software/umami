import { ReactNode } from 'react';
import { Grid, Row, Column, Text, Loading, Icon } from '@umami/react-zen';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { Users } from '@/components/icons';
import { useMessages, useLocale, useRetentionQuery } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];

export function RetentionTable({ websiteId, days = DAYS }: { websiteId: string; days?: number[] }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { data: x, isLoading } = useRetentionQuery(websiteId);
  const data = x as any;

  if (isLoading) {
    return <Loading position="page" />;
  }

  if (!data) {
    return <EmptyPlaceholder />;
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
    <Column gap="1">
      <Grid
        columns="120px repeat(auto-fit, 100px)"
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
            <Text weight="bold" align="center">
              {formatMessage(labels.day)} {n}
            </Text>
          </Column>
        ))}
      </Grid>
      {rows.map(({ date, visitors, records }: any, rowIndex: number) => {
        return (
          <Grid key={rowIndex} columns="120px repeat(auto-fit, 100px)" gap="1" autoFlow="column">
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
              return <Cell key={day}>{percentage ? `${Number(percentage).toFixed(2)}%` : ''}</Cell>;
            })}
          </Grid>
        );
      })}
    </Column>
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
