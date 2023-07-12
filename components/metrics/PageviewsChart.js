import { useMemo } from 'react';
import BarChart from './BarChart';
import { useLocale, useTheme, useMessages } from 'hooks';
import { renderDateLabels, renderStatusTooltipPopup } from 'lib/charts';

export function PageviewsChart({ websiteId, data, unit, className, loading, ...props }) {
  const { formatMessage, labels } = useMessages();
  const { colors } = useTheme();
  const { locale } = useLocale();

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
      renderXLabel={renderDateLabels(unit, locale)}
      renderTooltipPopup={renderStatusTooltipPopup(unit, locale)}
    />
  );
}

export default PageviewsChart;
