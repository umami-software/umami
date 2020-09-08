import React from 'react';
import { useIntl } from 'react-intl';
import CheckVisible from 'components/helpers/CheckVisible';
import BarChart from './BarChart';

export default function PageviewsChart({ websiteId, data, unit, records, className }) {
  const intl = useIntl();

  const handleUpdate = chart => {
    const {
      data: { datasets },
    } = chart;

    datasets[0].data = data.uniques;
    datasets[0].label = intl.formatMessage({
      id: 'metrics.unique-visitors',
      defaultMessage: 'Unique visitors',
    });
    datasets[1].data = data.pageviews;
    datasets[1].label = intl.formatMessage({
      id: 'metrics.page-views',
      defaultMessage: 'Page views',
    });

    chart.update();
  };

  if (!data) {
    return null;
  }

  return (
    <CheckVisible>
      {visible => (
        <BarChart
          className={className}
          chartId={websiteId}
          datasets={[
            {
              label: intl.formatMessage({
                id: 'metrics.unique-visitors',
                defaultMessage: 'Unique visitors',
              }),
              data: data.uniques,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.4)',
              borderColor: 'rgb(13, 102, 208, 0.4)',
              borderWidth: 1,
            },
            {
              label: intl.formatMessage({
                id: 'metrics.page-views',
                defaultMessage: 'Page views',
              }),
              data: data.pageviews,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.2)',
              borderColor: 'rgb(13, 102, 208, 0.2)',
              borderWidth: 1,
            },
          ]}
          unit={unit}
          records={records}
          animationDuration={visible ? 300 : 0}
          onUpdate={handleUpdate}
        />
      )}
    </CheckVisible>
  );
}
