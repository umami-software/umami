import React from 'react';
import { useIntl } from 'react-intl';
import tinycolor from 'tinycolor2';
import CheckVisible from 'components/helpers/CheckVisible';
import BarChart from './BarChart';
import useTheme from 'hooks/useTheme';
import { THEME_COLORS, DEFAULT_ANIMATION_DURATION } from 'lib/constants';

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
  const intl = useIntl();
  const [theme] = useTheme();
  const primaryColor = tinycolor(THEME_COLORS[theme].primary);
  const colors = {
    views: {
      background: primaryColor.setAlpha(0.4).toRgbString(),
      border: primaryColor.setAlpha(0.5).toRgbString(),
    },
    visitors: {
      background: primaryColor.setAlpha(0.6).toRgbString(),
      border: primaryColor.setAlpha(0.7).toRgbString(),
    },
  };

  const handleUpdate = chart => {
    const {
      data: { datasets },
    } = chart;

    datasets[0].data = data.sessions;
    datasets[0].label = intl.formatMessage({
      id: 'metrics.unique-visitors',
      defaultMessage: 'Unique visitors',
    });
    datasets[1].data = data.pageviews;
    datasets[1].label = intl.formatMessage({
      id: 'metrics.page-views',
      defaultMessage: 'Page views',
    });
  };

  if (!data) {
    return null;
  }

  return (
    <CheckVisible>
      {visible => (
        <BarChart
          {...props}
          className={className}
          chartId={websiteId}
          datasets={[
            {
              label: intl.formatMessage({
                id: 'metrics.unique-visitors',
                defaultMessage: 'Unique visitors',
              }),
              data: data.sessions,
              lineTension: 0,
              backgroundColor: colors.visitors.background,
              borderColor: colors.visitors.border,
              borderWidth: 1,
            },
            {
              label: intl.formatMessage({
                id: 'metrics.page-views',
                defaultMessage: 'Page views',
              }),
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
      )}
    </CheckVisible>
  );
}
