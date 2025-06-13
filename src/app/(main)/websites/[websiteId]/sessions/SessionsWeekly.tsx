import { Row, Grid, Text } from '@umami/react-zen';
import { format, startOfDay, addHours } from 'date-fns';
import { useLocale, useMessages, useWebsiteSessionsWeeklyQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { getDayOfWeekAsDate } from '@/lib/date';
import { Focusable, Tooltip, TooltipTrigger } from '@umami/react-zen';

export function SessionsWeekly({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useWebsiteSessionsWeeklyQuery(websiteId);
  const { dateLocale } = useLocale();
  const { labels, formatMessage } = useMessages();
  const { weekStartsOn } = dateLocale.options;
  const daysOfWeek = Array(7)
    .fill(weekStartsOn)
    .map((d, i) => (d + i) % 7);

  const [, max] = data
    ? data.reduce((arr: number[], hours: number[], index: number) => {
        const min = Math.min(...hours);
        const max = Math.max(...hours);

        if (index === 0) {
          return [min, max];
        }

        if (min < arr[0]) {
          arr[0] = min;
        }

        if (max > arr[1]) {
          arr[1] = max;
        }

        return arr;
      }, [])
    : [];

  return (
    <LoadingPanel isEmpty={!data?.length} isLoading={isLoading} error={error}>
      <Grid columns="repeat(8, 1fr)" gap>
        <Grid rows="repeat(25, 20px)" gap="1">
          <Row>&nbsp;</Row>
          {Array(24)
            .fill(null)
            .map((_, i) => {
              const label = format(addHours(startOfDay(new Date()), i), 'p', { locale: dateLocale })
                .replace(/\D00 ?/, '')
                .toLowerCase();
              return (
                <Row key={i} justifyContent="flex-end">
                  <Text color="muted" weight="bold">
                    {label}
                  </Text>
                </Row>
              );
            })}
        </Grid>
        {data &&
          daysOfWeek.map((index: number) => {
            const day = data[index];
            return (
              <Grid
                rows="repeat(25, 20px)"
                justifyContent="center"
                alignItems="center"
                key={index}
                gap="1"
              >
                <Row>
                  <Text weight="bold" align="center">
                    {format(getDayOfWeekAsDate(index), 'EEE', { locale: dateLocale })}
                  </Text>
                </Row>
                {day?.map((count: number, j) => {
                  const pct = count / max;
                  return (
                    <TooltipTrigger key={j} delay={0} isDisabled={count <= 0}>
                      <Focusable>
                        <Row backgroundColor="2" width="20px" height="20px" borderRadius="full">
                          <Row
                            backgroundColor="primary"
                            width="20px"
                            height="20px"
                            borderRadius="full"
                            style={{ opacity: pct, transform: `scale(${pct})` }}
                          />
                        </Row>
                      </Focusable>
                      <Tooltip placement="right">{`${formatMessage(
                        labels.visitors,
                      )}: ${count}`}</Tooltip>
                    </TooltipTrigger>
                  );
                })}
              </Grid>
            );
          })}
      </Grid>
    </LoadingPanel>
  );
}
