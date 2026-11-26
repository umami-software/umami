import { Column } from '@umami/react-zen';
import { useEffect, useRef, useState } from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, usePropertyValuesQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import {
  getOtherTotal,
  getPropertyTableData,
} from '@/components/property-data/getPropertyTableData';
import { CHART_COLORS, DATA_TYPE } from '@/lib/constants';

const STACKED_LAYOUT_WIDTH = 900;
const OTHER_COLOR = '#a0a0a0';

export function BoardEventProperties({
  websiteId,
  eventName,
  propertyName,
  limit = 10,
  dataType,
}: {
  websiteId: string;
  eventName?: string;
  propertyName?: string;
  limit?: number | string;
  dataType?: number | string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);
  const { t, labels } = useMessages();
  const { data, error, isLoading, isFetching } = usePropertyValuesQuery(
    'event',
    websiteId,
    propertyName,
    Number(dataType) === DATA_TYPE.array ? DATA_TYPE.array : undefined,
    [],
    eventName,
    { enabled: !!(websiteId && eventName && propertyName) },
  );

  // The values endpoint covers every data type; the series endpoint only returns strings and booleans.
  const rows = (data ?? []) as { value: string; total: number; grandTotal?: number }[];
  const totals = rows
    .map(({ value, total }) => ({ value: String(value), total: Number(total) }))
    .sort((a, b) => b.total - a.total);
  // The server returns its top 100 values; grandTotal also counts the ones past that limit.
  const grandTotal = rows.length ? Number(rows[0].grandTotal) || undefined : undefined;
  const itemLimit = Number(limit) || 10;
  const items = getPropertyTableData(totals, itemLimit, grandTotal);

  // The pie gets an "Other" slice for everything not shown, so its shares match the table's.
  const otherTotal = getOtherTotal(totals, itemLimit, grandTotal);
  const chartData = {
    labels: [...items.map(({ label }) => label), ...(otherTotal ? [t(labels.other)] : [])],
    datasets: [
      {
        data: [...items.map(({ count }) => count), ...(otherTotal ? [otherTotal] : [])],
        backgroundColor: [
          ...items.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
          OTHER_COLOR,
        ],
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

  // The wrapper always renders, so the observer attaches on mount even before an event and property
  // are picked (the editor preview mounts this component first and fills the config in afterwards).
  return (
    <div ref={wrapperRef}>
      {!eventName || !propertyName ? (
        <Empty message={t(labels.selectEvent)} />
      ) : (
        <LoadingPanel
          data={items}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          minHeight="300px"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 24,
              alignItems: 'start',
            }}
          >
            <Column style={{ minWidth: 0 }}>
              <ListTable title={propertyName} metric={t(labels.count)} data={items} />
            </Column>
            <Column style={{ minWidth: 0, overflow: 'hidden' }}>
              <PieChart
                type="doughnut"
                chartData={chartData}
                height={isStacked ? '240px' : '300px'}
              />
            </Column>
          </div>
        </LoadingPanel>
      )}
    </div>
  );
}
