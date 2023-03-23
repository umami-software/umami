import { useMemo } from 'react';
import { useVisible } from 'react-basics';
import { colord } from 'colord';
import BarChart from './BarChart';
import { THEME_COLORS, DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import useTheme from 'hooks/useTheme';
import useMessages from 'hooks/useMessages';

export default function PageviewsChart({
  websiteId,
  data,
  unit,
  records,
  className,
  loading,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  ...props
}) {
  const { formatMessage, labels } = useMessages();
  const [theme] = useTheme();
  const { ref, visible } = useVisible();

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

  const handleUpdate = chart => {
    const {
      data: { datasets },
    } = chart;

    datasets[0].data = data.sessions;
    datasets[0].label = formatMessage(labels.uniqueVisitors);
    datasets[1].data = data.pageviews;
    datasets[1].label = formatMessage(labels.pageViews);
  };

  if (!data) {
    return null;
  }

  const datasets = [
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

  return (
    <div ref={ref}>
      <BarChart
        {...props}
        key={websiteId}
        className={className}
        datasets={datasets}
        unit={unit}
        records={records}
        animationDuration={visible ? animationDuration : 0}
        onUpdate={handleUpdate}
        loading={loading}
      />
    </div>
  );
}
