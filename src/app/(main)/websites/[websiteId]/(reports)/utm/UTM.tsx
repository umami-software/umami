import { Column, Grid, Heading, Text } from '@umami/react-zen';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useMessages, useUTMMetricsQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { CHART_COLORS, UTM_PARAMS } from '@/lib/constants';

export interface UTMProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export function UTM(props: UTMProps) {
  return (
    <Column gap>
      {UTM_PARAMS.map(param => (
        <UTMDimension key={param} {...props} param={param} />
      ))}
    </Column>
  );
}

function UTMDimension({ websiteId, startDate, endDate, param }: UTMProps & { param: string }) {
  const { t, labels } = useMessages();
  const {
    data: items = [],
    error,
    isLoading,
  } = useUTMMetricsQuery({ websiteId, startDate, endDate, type: param });
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
  const total = items.reduce((sum, { views }) => {
    return +sum + +views;
  }, 0);

  return (
    <LoadingPanel data={items} isLoading={isLoading} error={error} minHeight="300px">
      <Panel>
        <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap="6">
          <Column>
            <Heading>
              <Text transform="capitalize">{param.replace(/^utm_/, '')}</Text>
            </Heading>
            <ListTable
              metric={t(labels.views)}
              data={items.map(({ utm, views }) => ({
                label: utm,
                count: views,
                percent: (views / total) * 100,
              }))}
            />
          </Column>
          <Column>
            <PieChart type="doughnut" chartData={chartData} />
          </Column>
        </Grid>
      </Panel>
    </LoadingPanel>
  );
}
