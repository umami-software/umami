import { useVisible } from 'react-basics';
import { useIntl } from 'react-intl';
import { colord } from 'colord';
import BarChart from './BarChart';
import useTheme from 'hooks/useTheme';
import { THEME_COLORS, DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import { labels } from 'components/messages';
import { useMemo } from 'react';

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
  const { formatMessage } = useIntl();
  const [theme] = useTheme();
  const { ref, visible } = useVisible();

  const colors = useMemo(() => {
    const primaryColor = colord(THEME_COLORS[theme].primary);
    return {
      views: {
        background: primaryColor.alpha(0.4).toRgbString(),
        border: primaryColor.alpha(0.5).toRgbString(),
      },
      visitors: {
        background: primaryColor.alpha(0.6).toRgbString(),
        border: primaryColor.alpha(0.7).toRgbString(),
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

  return (
    <div ref={ref}>
      <BarChart
        {...props}
        className={className}
        chartId={websiteId}
        datasets={[
          {
            label: formatMessage(labels.uniqueVisitors),
            data: data.sessions,
            lineTension: 0,
            backgroundColor: colors.visitors.background,
            borderColor: colors.visitors.border,
            borderWidth: 1,
          },
          {
            label: formatMessage(labels.pageViews),
            data: data.pageviews,
            lineTension: 0,
            backgroundColor: colors.views.background,
            borderColor: colors.views.border,
            borderWidth: 1,
          },
        ]}
        unit={unit}
        records={records}
        animationDuration={visible ? animationDuration : 0}
        onUpdate={handleUpdate}
        loading={loading}
      />
    </div>
  );
}
