import { Column, Heading, Text } from '@umami/react-zen';
import { useEffect, useRef, useState } from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange, useMessages, useResultQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { CHART_COLORS } from '@/lib/constants';

const STACKED_LAYOUT_WIDTH = 900;

export function BoardUTM({
  websiteId,
  param = 'utm_source',
  limit = 10,
}: {
  websiteId: string;
  param?: string;
  limit?: number | string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const { t, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery<any>('utm', {
    websiteId,
    startDate,
    endDate,
  });

  const itemLimit = Number(limit) || 10;
  const items = (data?.[param] ?? []).slice(0, itemLimit);
  const total = items.reduce((sum, { views }) => {
    return +sum + +views;
  }, 0);
  const chartData = {
    labels: items.map(({ utm }) => utm),
    datasets: [
      {
        data: items.map(({ views }) => views),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      },
    ],
  };

  useEffect(() => {
    const updateLayout = () => {
      const width = wrapperRef.current?.clientWidth ?? 0;

      setIsStacked(current => {
        const next = width > 0 && width < STACKED_LAYOUT_WIDTH;
        return current === next ? current : next;
      });
    };

    updateLayout();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateLayout) : null;

    if (wrapperRef.current && resizeObserver) {
      resizeObserver.observe(wrapperRef.current);
    }

    window.addEventListener('resize', updateLayout);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  return (
    <LoadingPanel data={items} isLoading={isLoading} error={error} minHeight="300px">
      <div ref={wrapperRef}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isStacked
              ? 'minmax(0, 1fr)'
              : 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <Column style={{ minWidth: 0 }}>
            <Heading>
              <Text transform="capitalize">{param.replace(/^utm_/, '')}</Text>
            </Heading>
            <ListTable
              metric={t(labels.views)}
              data={items.map(({ utm, views }) => ({
                label: utm,
                count: views,
                percent: total ? (views / total) * 100 : 0,
              }))}
            />
          </Column>
          <Column style={{ minWidth: 0, overflow: 'hidden' }}>
            <PieChart
              type="doughnut"
              chartData={chartData}
              height={isStacked ? '240px' : '300px'}
            />
          </Column>
        </div>
      </div>
    </LoadingPanel>
  );
}
