import { useCallback, useMemo } from 'react';
import { StatusLight } from 'react-basics';
import BarChart from './BarChart';
import useTheme from 'hooks/useTheme';
import useMessages from 'hooks/useMessages';
import useLocale from 'hooks/useLocale';
import { dateFormat } from 'lib/date';
import { formatLongNumber } from 'lib/format';

export function PageviewsChart({ websiteId, data, unit, className, loading, ...props }) {
  const { formatMessage, labels } = useMessages();
  const { colors } = useTheme();
  const { locale } = useLocale();

  const renderXLabel = useCallback(
    (label, index, values) => {
      const d = new Date(values[index].value);

      switch (unit) {
        case 'minute':
          return dateFormat(d, 'h:mm', locale);
        case 'hour':
          return dateFormat(d, 'p', locale);
        case 'day':
          return dateFormat(d, 'MMM d', locale);
        case 'month':
          return dateFormat(d, 'MMM', locale);
        case 'year':
          return dateFormat(d, 'YYY', locale);
        default:
          return label;
      }
    },
    [locale, unit],
  );

  const renderTooltip = useCallback(
    (setTooltip, model) => {
      const { opacity, labelColors, dataPoints } = model.tooltip;

      if (!dataPoints?.length || !opacity) {
        setTooltip(null);
        return;
      }

      const formats = {
        millisecond: 'T',
        second: 'pp',
        minute: 'p',
        hour: 'h:mm aaa - PP',
        day: 'PPPP',
        week: 'PPPP',
        month: 'LLLL yyyy',
        quarter: 'qqq',
        year: 'yyyy',
      };

      setTooltip(
        <>
          <div>{dateFormat(new Date(dataPoints[0].raw.x), formats[unit], locale)}</div>
          <div>
            <StatusLight color={labelColors?.[0]?.backgroundColor}>
              {formatLongNumber(dataPoints[0].raw.y)} {dataPoints[0].dataset.label}
            </StatusLight>
          </div>
        </>,
      );
    },
    [unit],
  );

  const datasets = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: formatMessage(labels.uniqueVisitors),
        data: data.sessions,
        borderWidth: 1,
        ...colors.chart.visitors,
      },
      {
        label: formatMessage(labels.pageViews),
        data: data.pageviews,
        borderWidth: 1,
        ...colors.chart.views,
      },
    ];
  }, [data, locale, colors]);

  return (
    <BarChart
      {...props}
      key={websiteId}
      className={className}
      datasets={datasets}
      unit={unit}
      loading={loading}
      renderXLabel={renderXLabel}
      renderTooltip={renderTooltip}
    />
  );
}

export default PageviewsChart;
