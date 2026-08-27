import { useCallback, useMemo } from 'react';
import type { ChartAnnotation } from '@/components/charts/ChartAnnotationMarkers';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateParameters,
  useDateRange,
  useNavigation,
  useTimezone,
  useWebsiteAnnotationsQuery,
} from '@/components/hooks';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { PageviewsChart } from '@/components/metrics/PageviewsChart';
import { getAnnotationDateRangeValue } from '@/lib/annotations';

export function WebsiteChart({
  websiteId,
  compareMode,
}: {
  websiteId: string;
  compareMode?: boolean;
}) {
  const { timezone, localFromUtc } = useTimezone();
  const { dateRange, dateCompare } = useDateRange({ timezone: timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { startAt, endAt } = useDateParameters();
  const { router, updateParams } = useNavigation();
  const { data: annotationData } = useWebsiteAnnotationsQuery(websiteId, {
    startAt,
    endAt,
    pageSize: 1000,
  });
  const { data, isLoading, isFetching, error } = useWebsitePageviewsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });
  const { pageviews, sessions, compare } = (data || {}) as any;

  const chartData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [] };
    }

    return {
      pageviews,
      sessions,
      ...(compare && {
        compare: {
          pageviews: pageviews.map(({ x }, i) => ({
            x,
            y: compare.pageviews[i]?.y,
            d: compare.pageviews[i]?.x,
          })),
          sessions: sessions.map(({ x }, i) => ({
            x,
            y: compare.sessions[i]?.y,
            d: compare.sessions[i]?.x,
          })),
        },
      }),
    };
  }, [data, startDate, endDate, unit]);

  const annotations = useMemo<ChartAnnotation[]>(() => {
    return (annotationData?.data || []).map(({ id, date, note, allDay }) => ({
      id,
      date: localFromUtc(new Date(date)),
      label: note,
      allDay,
    }));
  }, [annotationData, timezone]);

  const handleAnnotationClick = useCallback(
    (annotation: ChartAnnotation) => {
      router.push(
        updateParams({
          date: getAnnotationDateRangeValue(annotation.date, annotation.allDay !== false),
          offset: undefined,
        }),
      );
    },
    [router, updateParams],
  );

  return (
    <LoadingPanel data={data} isFetching={isFetching} isLoading={isLoading} error={error}>
      <PageviewsChart
        key={value}
        data={chartData}
        minDate={startDate}
        maxDate={endDate}
        unit={unit}
        annotations={annotations}
        onAnnotationClick={handleAnnotationClick}
      />
    </LoadingPanel>
  );
}
