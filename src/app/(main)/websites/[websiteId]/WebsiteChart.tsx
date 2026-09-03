import { isSameDay } from 'date-fns';
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
import { type AnnotationRange, getAnnotationDateRangeValue } from '@/lib/annotations';
import { DATE_FUNCTIONS } from '@/lib/date';

export function WebsiteChart({
  websiteId,
  compareMode,
  showAnnotations,
  onAnnotationMoreClick,
}: {
  websiteId: string;
  compareMode?: boolean;
  showAnnotations?: boolean;
  onAnnotationMoreClick?: (range: AnnotationRange) => void;
}) {
  const { timezone, localFromUtc, localToUtc } = useTimezone();
  const { dateRange, dateCompare } = useDateRange({ timezone: timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { startAt, endAt } = useDateParameters();
  const { router, updateParams } = useNavigation();
  const { data: annotationData } = useWebsiteAnnotationsQuery(
    websiteId,
    { startAt, endAt, pageSize: 1000 },
    { enabled: !!showAnnotations && !!websiteId },
  );
  const { data, isLoading, isFetching, error } = useWebsitePageviewsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });
  const { pageviews, sessions, compare } = (data || {}) as any;
  const canDrillIntoAnnotation =
    unit !== 'hour' && unit !== 'minute' && !isSameDay(startDate, endDate);

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
    const isSubDayUnit = unit === 'hour' || unit === 'minute';

    return (annotationData?.data || [])
      .filter(({ allDay }) => !isSubDayUnit || allDay === false)
      .map(({ id, date, note, allDay }) => {
        const annotationDate = localFromUtc(new Date(date));

        return {
          id,
          date: annotationDate,
          markerDate: DATE_FUNCTIONS[unit].start(annotationDate),
          label: note,
          allDay,
          isClickable: canDrillIntoAnnotation,
          isGroupClickable: unit === 'month',
        };
      });
  }, [annotationData, timezone, unit, canDrillIntoAnnotation]);

  const handleAnnotationClick = useCallback(
    (annotations: ChartAnnotation[]) => {
      const [annotation] = annotations;
      const hasOneDate = annotations.every(item => isSameDay(item.date, annotation.date));

      if (hasOneDate) {
        router.push(
          updateParams({
            date: getAnnotationDateRangeValue(annotation.date, annotation.allDay !== false),
            offset: undefined,
          }),
        );
        return;
      }

      const markerDate = annotation.markerDate || annotation.date;
      const startDate = DATE_FUNCTIONS.month.start(markerDate);
      const endDate = DATE_FUNCTIONS.month.end(markerDate);

      router.push(
        updateParams({
          date: `range:${startDate.getTime()}:${endDate.getTime()}`,
          offset: undefined,
        }),
      );
    },
    [router, updateParams],
  );

  const handleAnnotationMoreClick = useCallback(
    (annotations: ChartAnnotation[]) => {
      const markerDate = annotations[0].markerDate || annotations[0].date;
      const { start, end } = DATE_FUNCTIONS[unit];

      onAnnotationMoreClick?.({
        startAt: +localToUtc(start(markerDate)),
        endAt: +localToUtc(end(markerDate)),
      });
    },
    [localToUtc, onAnnotationMoreClick, unit],
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
        onAnnotationMoreClick={onAnnotationMoreClick ? handleAnnotationMoreClick : undefined}
      />
    </LoadingPanel>
  );
}
