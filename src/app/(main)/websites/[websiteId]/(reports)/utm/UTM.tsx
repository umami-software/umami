import { Column, Grid, Heading, Text } from '@umami/react-zen';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useMessages, useResultQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { CHART_COLORS, UTM_PARAMS } from '@/lib/constants';
import { DialogButton } from '@/components/input/DialogButton';
import { Plus } from 'lucide-react';
import { GoalEditForm } from '../goals/GoalEditForm';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BuildUTMLink } from './BuildUTMLink';

export interface UTMProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export function UTM({ websiteId, startDate, endDate }: UTMProps) {
  const { t, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery<any>('utm', {
    websiteId,
    startDate,
    endDate,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="300px">
      {data && (
        <Column gap>
          <SectionHeader>
            <DialogButton
              variant="primary"
              icon={<Plus />}
              label="UTM Link generator"
              title="UTM Link generator"
              minWidth="400px"
              minHeight="300px"
            >
              {({ close }) => <BuildUTMLink />}
            </DialogButton>
          </SectionHeader>
          {UTM_PARAMS.map(param => {
            const items = data?.[param];

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
              <Panel key={param}>
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
            );
          })}
        </Column>
      )}
    </LoadingPanel>
  );
}
