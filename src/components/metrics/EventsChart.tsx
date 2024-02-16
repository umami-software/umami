import { useMemo } from 'react';
import { Loading } from 'react-basics';
import { colord } from 'colord';
import BarChart from './BarChart';
import { getDateArray } from 'lib/date';
import {
  useLocale,
  useDateRange,
  useTimezone,
  useNavigation,
  useWebsiteEvents,
} from 'components/hooks';
import { EVENT_COLORS } from 'lib/constants';
import { renderDateLabels, renderStatusTooltipPopup } from 'lib/charts';

export interface EventsChartProps {
  websiteId: string;
  className?: string;
  token?: string;
}

export function EventsChart({ websiteId, className, token }: EventsChartProps) {
  const [{ startDate, endDate, unit, offset }] = useDateRange(websiteId);
  const { locale } = useLocale();
  const [timezone] = useTimezone();
  const {
    query: { url, event },
  } = useNavigation();

  const { data, isLoading } = useWebsiteEvents(websiteId, {
    startAt: +startDate,
    endAt: +endDate,
    unit,
    timezone,
    url,
    event,
    token,
    offset,
  });

  const datasets = useMemo(() => {
    if (!data) return [];
    if (isLoading) return data;

    const map = (data as any[]).reduce((obj, { x, t, y }) => {
      if (!obj[x]) {
        obj[x] = [];
      }

      obj[x].push({ x: t, y });

      return obj;
    }, {});

    Object.keys(map).forEach(key => {
      map[key] = getDateArray(map[key], startDate, endDate, unit);
    });

    return Object.keys(map).map((key, index) => {
      const color = colord(EVENT_COLORS[index % EVENT_COLORS.length]);
      return {
        label: key,
        data: map[key],
        lineTension: 0,
        backgroundColor: color.alpha(0.6).toRgbString(),
        borderColor: color.alpha(0.7).toRgbString(),
        borderWidth: 1,
      };
    });
  }, [data, isLoading, startDate, endDate, unit]);

  if (isLoading) {
    return <Loading icon="dots" />;
  }

  return (
    <BarChart
      className={className}
      datasets={datasets as any[]}
      unit={unit}
      stacked={true}
      renderXLabel={renderDateLabels(unit, locale)}
      renderTooltipPopup={renderStatusTooltipPopup(unit, locale)}
      isLoading={isLoading}
    />
  );
}

export default EventsChart;
