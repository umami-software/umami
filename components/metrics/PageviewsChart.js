import { useMemo } from 'react';
import { colord } from 'colord';
import BarChart from './BarChart';
import { THEME_COLORS } from 'lib/constants';
import useTheme from 'hooks/useTheme';
import useMessages from 'hooks/useMessages';

export default function PageviewsChart({
  websiteId,
  data,
  unit,
  records,
  className,
  loading,
  ...props
}) {
  const { formatMessage, labels } = useMessages();
  const [theme] = useTheme();

  const colors = useMemo(() => {
    const primaryColor = colord(THEME_COLORS[theme].primary);
    return {
      views: {
        hoverBackgroundColor: primaryColor.alpha(0.7).toRgbString(),
        backgroundColor: primaryColor.alpha(0.4).toRgbString(),
        borderColor: primaryColor.alpha(0.7).toRgbString(),
        hoverBorderColor: primaryColor.toRgbString(),
      },
      visitors: {
        hoverBackgroundColor: primaryColor.alpha(0.9).toRgbString(),
        backgroundColor: primaryColor.alpha(0.6).toRgbString(),
        borderColor: primaryColor.alpha(0.9).toRgbString(),
        hoverBorderColor: primaryColor.toRgbString(),
      },
    };
  }, [theme]);

  const datasets = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: formatMessage(labels.uniqueVisitors),
        data: data.sessions,
        borderWidth: 1,
        ...colors.visitors,
      },
      {
        label: formatMessage(labels.pageViews),
        data: data.pageviews,
        borderWidth: 1,
        ...colors.views,
      },
    ];
  }, [data]);

  return (
    <BarChart
      {...props}
      key={websiteId}
      className={className}
      datasets={datasets}
      unit={unit}
      records={records}
      loading={loading}
    />
  );
}
