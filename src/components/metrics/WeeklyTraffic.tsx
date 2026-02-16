import { Focusable, Grid, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { addHours, format, startOfDay } from 'date-fns';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useLocale, useMessages, useWeeklyTrafficQuery } from '@/components/hooks';
import { getDayOfWeekAsDate } from '@/lib/date';

export function WeeklyTraffic({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useWeeklyTrafficQuery(websiteId);
  const { dateLocale } = useLocale();
  const { labels, t } = useMessages();
  const { weekStartsOn } = dateLocale.options;
  const daysOfWeek = Array(7)
    .fill(weekStartsOn)
    .map((d, i) => (d + i) % 7);

  const [, max = 1] = data
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
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <Grid columns="repeat(8, 1fr)" gap>
        {data && (
          <>
            <Row>&nbsp;</Row>
            {daysOfWeek.map((index: number) => (
              <Row key={index} alignItems="center" justifyContent="center">
                <Text weight="bold" align="center">
                  {format(getDayOfWeekAsDate(index), 'EEE', { locale: dateLocale })}
                </Text>
              </Row>
            ))}
            <Grid rows="repeat(24, 16px)" gap="1">
              {Array(24)
                .fill(null)
                .map((_, i) => {
                  const label = format(addHours(startOfDay(new Date()), i), 'haaa', {
                    locale: dateLocale,
                  });
                  return (
                    <Row key={i} justifyContent="flex-end">
                      <Text color="muted" size="sm">
                        {label}
                      </Text>
                    </Row>
                  );
                })}
            </Grid>
            {daysOfWeek.map((index: number) => {
              const day = data[index];
              return (
                <Grid
                  rows="repeat(24, 16px)"
                  justifyContent="center"
                  alignItems="center"
                  key={index}
                  gap="1"
                >
                  {day?.map((count: number, j) => {
                    const pct = max ? count / max : 0;
                    return (
                      <TooltipTrigger key={j} delay={0} isDisabled={count <= 0}>
                        <Focusable>
                          <Row
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor="surface-raised"
                            width="16px"
                            height="16px"
                            borderRadius="full"
                            style={{ margin: '0 auto' }}
                            role="button"
                          >
                            <Row
                              backgroundColor="primary"
                              width="16px"
                              height="16px"
                              borderRadius="full"
                              style={{ opacity: pct, transform: `scale(${pct})` }}
                            />
                          </Row>
                        </Focusable>
                        <Tooltip placement="right" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                          <Text size="base">{`${t(labels.visitors)}: ${count}`}</Text>
                        </Tooltip>
                      </TooltipTrigger>
                    );
                  })}
                </Grid>
              );
            })}
          </>
        )}
      </Grid>
    </LoadingPanel>
  );
}
