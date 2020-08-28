import React from 'react';
import CheckVisible from 'components/helpers/CheckVisible';
import BarChart from './BarChart';

export default function PageviewsChart({ websiteId, data, unit, className }) {
  const handleUpdate = chart => {
    const {
      data: { datasets },
    } = chart;

    datasets[0].data = data.uniques;
    datasets[1].data = data.pageviews;

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
              label: 'unique visitors',
              data: data.uniques,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.4)',
              borderColor: 'rgb(13, 102, 208, 0.4)',
              borderWidth: 1,
            },
            {
              label: 'page views',
              data: data.pageviews,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.2)',
              borderColor: 'rgb(13, 102, 208, 0.2)',
              borderWidth: 1,
            },
          ]}
          unit={unit}
          records={data.pageviews.length}
          animationDuration={visible ? 300 : 0}
          onUpdate={handleUpdate}
        />
      )}
    </CheckVisible>
  );
}
