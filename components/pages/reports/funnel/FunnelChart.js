import { useCallback, useContext, useMemo } from 'react';
import { Loading } from 'react-basics';
import useMessages from 'hooks/useMessages';
import useTheme from 'hooks/useTheme';
import BarChart from 'components/metrics/BarChart';
import { formatLongNumber } from 'lib/format';
import styles from './FunnelChart.module.css';
import { ReportContext } from '../Report';

export function FunnelChart({ className, loading }) {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { colors } = useTheme();

  const { parameters, data } = report || {};

  const renderXLabel = useCallback(
    (label, index) => {
      return parameters.urls[index];
    },
    [parameters],
  );

  const renderTooltip = useCallback((setTooltip, model) => {
    const { opacity, dataPoints } = model.tooltip;

    if (!dataPoints?.length || !opacity) {
      setTooltip(null);
      return;
    }

    setTooltip(`${formatLongNumber(dataPoints[0].raw.y)} ${formatMessage(labels.visitors)}`);
  }, []);

  const datasets = useMemo(() => {
    return [
      {
        label: formatMessage(labels.uniqueVisitors),
        data: data,
        borderWidth: 1,
        ...colors.chart.visitors,
      },
    ];
  }, [data]);

  if (loading) {
    return <Loading icon="dots" className={styles.loading} />;
  }

  return (
    <BarChart
      className={className}
      datasets={datasets}
      unit="day"
      loading={loading}
      renderXLabel={renderXLabel}
      renderTooltip={renderTooltip}
      XAxisType="category"
    />
  );
}

export default FunnelChart;
