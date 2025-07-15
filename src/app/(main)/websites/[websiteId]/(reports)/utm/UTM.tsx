import { Grid, Column, Heading, Text } from '@umami/react-zen';
import { firstBy } from 'thenby';
import { CHART_COLORS, UTM_PARAMS } from '@/lib/constants';
import { useResultQuery } from '@/components/hooks';
import { PieChart } from '@/components/charts/PieChart';
import { ListTable } from '@/components/metrics/ListTable';
import { useMessages } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export interface UTMProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export function UTM({ websiteId, startDate, endDate }: UTMProps) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery<any>('utm', {
    websiteId,
    startDate,
    endDate,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Column gap>
          {UTM_PARAMS.map(param => {
            const items = toArray(data?.[param]);
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
                <Grid columns="1fr 1fr">
                  <Column>
                    <Heading>
                      <Text transform="capitalize">{param.replace(/^utm_/, '')}</Text>
                    </Heading>
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
                    <PieChart type="doughnut" chartData={chartData} />
                  </Column>
                </Grid>
              </Panel>
            );
          })}
        </Column>
      )}
    </LoadingPanel>
  );
}

function toArray(data: Record<string, number> = {}) {
  return Object.keys(data)
    .map(key => {
      return { name: key, value: data[key] };
    })
    .sort(firstBy('value', -1));
}
