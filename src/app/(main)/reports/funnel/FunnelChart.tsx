import { JSX, useCallback, useContext, useMemo } from 'react';
import { Loading, StatusLight } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useTheme from 'components/hooks/useTheme';
import BarChart from 'components/metrics/BarChart';
import { formatLongNumber } from 'lib/format';
import { ReportContext } from '../[id]/Report';
import styles from './FunnelChart.module.css';

export interface FunnelChartProps {
  className?: string;
  isLoading?: boolean;
}

export function FunnelChart({ className, isLoading }: FunnelChartProps) {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { colors } = useTheme();

  const { parameters, data } = report || {};

  const renderXLabel = useCallback(
    (label: string, index: number) => {
      return parameters.urls[index];
    },
    [parameters],
  );

  const renderTooltipPopup = useCallback(
    (
      setTooltipPopup: (arg0: JSX.Element) => void,
      model: { tooltip: { opacity: any; labelColors: any; dataPoints: any } },
    ) => {
      const { opacity, labelColors, dataPoints } = model.tooltip;

      if (!dataPoints?.length || !opacity) {
        setTooltipPopup(null);
        return;
      }

      setTooltipPopup(
        <>
          <div>
            {formatLongNumber(dataPoints[0].raw.y)} {formatMessage(labels.visitors)}
          </div>
          <div>
            <StatusLight color={labelColors?.[0]?.backgroundColor}>
              {formatLongNumber(dataPoints[0].raw.z)}% {formatMessage(labels.dropoff)}
            </StatusLight>
          </div>
        </>,
      );
    },
    [],
  );

  const datasets = useMemo(() => {
    return [
      {
        label: formatMessage(labels.uniqueVisitors),
        data: data,
        borderWidth: 1,
        ...colors.chart.visitors,
      },
    ];
  }, [data, colors, formatMessage, labels]);

  if (isLoading) {
    return <Loading icon="dots" className={styles.loading} />;
  }

  return (
    <BarChart
      className={className}
      datasets={datasets}
      unit="day"
      isLoading={isLoading}
      renderXLabel={renderXLabel}
      renderTooltipPopup={renderTooltipPopup}
      XAxisType="category"
    />
  );
}

export default FunnelChart;
