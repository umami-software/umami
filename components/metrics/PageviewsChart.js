import React from 'react';
import classNames from 'classnames';
import BarChart from './BarChart';
import styles from './PageviewsChart.module.css';

export default function PageviewsChart({ websiteId, data, unit, className, animationDuration }) {
  const handleUpdate = chart => {
    const {
      data: { datasets },
      options,
    } = chart;

    datasets[0].data = data.uniques;
    datasets[1].data = data.pageviews;
    options.animation.duration = animationDuration;

    chart.update();
  };

  if (!data) {
    return null;
  }

  return (
    <div className={classNames(styles.chart, className)}>
      <BarChart
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
        onUpdate={handleUpdate}
      />
    </div>
  );
}
