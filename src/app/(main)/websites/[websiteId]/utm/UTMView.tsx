import { Column, Heading } from '@umami/react-zen';
import { firstBy } from 'thenby';
import { CHART_COLORS, UTM_PARAMS } from '@/lib/constants';
import { useUTMQuery } from '@/components/hooks';
import { PieChart } from '@/components/charts/PieChart';
import { ListTable } from '@/components/metrics/ListTable';
import { useMessages } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { GridRow } from '@/components/common/GridRow';

function toArray(data: { [key: string]: number } = {}) {
  return Object.keys(data)
    .map(key => {
      return { name: key, value: data[key] };
    })
    .sort(firstBy('value', -1));
}

export function UTMView({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data } = useUTMQuery(websiteId);

  if (!data) {
    return null;
  }

  return (
    <Column gap>
      {UTM_PARAMS.map(param => {
        const items = toArray(data[param]);
        const chartData = {
          labels: items.map(({ name }) => name),
          datasets: [
            {
              data: items.map(({ value }) => value),
              backgroundColor: CHART_COLORS,
              borderWidth: 0,
            },
          ],
        };
        const total = items.reduce((sum, { value }) => {
          return +sum + +value;
        }, 0);

        return (
          <Panel key={param}>
            <GridRow layout="two">
              <Column>
                <Heading>{param.replace(/^utm_/, '')}</Heading>
                <ListTable
                  metric={formatMessage(labels.views)}
                  data={items.map(({ name, value }) => ({
                    x: name,
                    y: value,
                    z: (value / total) * 100,
                  }))}
                />
              </Column>
              <Column>
                <PieChart type="doughnut" data={chartData} />
              </Column>
            </GridRow>
          </Panel>
        );
      })}
    </Column>
  );
}
