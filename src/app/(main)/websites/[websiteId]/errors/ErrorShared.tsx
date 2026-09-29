'use client';
import {
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Grid,
  ListItem,
  Select,
  TextField,
} from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks/useApi';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useLocale } from '@/components/hooks/useLocale';
import { useNavigation } from '@/components/hooks/useNavigation';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';

export function useErrorFilters() {
  const { startAt, endAt } = useDateParameters();
  const { query } = useNavigation();
  return {
    startAt,
    endAt,
    page: Math.max(1, Math.min(10000, Number(query.page) || 1)),
    pageSize: 25,
    ...Object.fromEntries(
      ['status', 'search', 'release', 'environment', 'browser', 'urlPath']
        .filter(key => query[key])
        .map(key => [key, query[key]]),
    ),
  };
}

export function useErrorQuery(
  websiteId: string,
  path: string,
  params: object = {},
  enabled = true,
) {
  const { get, useQuery } = useApi();
  return useQuery({
    queryKey: ['errors', websiteId, path, params],
    queryFn: () => get(`/websites/${websiteId}/errors${path}`, params),
    enabled,
  });
}

export function ErrorFilters({ issue = false }: { issue?: boolean }) {
  const t = useTranslations('errorTracking');
  const { query, router, updateParams } = useNavigation();
  const fields = ['release', 'environment', 'browser', 'urlPath'];
  const filterKeys = issue ? fields : ['status', ...fields];

  return (
    <Form
      key={JSON.stringify(filterKeys.map(key => query[key]))}
      defaultValues={Object.fromEntries(filterKeys.map(key => [key, query[key] || '']))}
      onSubmit={values => {
        router.replace(
          updateParams({
            ...Object.fromEntries(filterKeys.map(key => [key, values[key] || undefined])),
            page: 1,
            occurrence: undefined,
          }),
        );
      }}
    >
      <Grid
        columns={{
          base: '1fr',
          md: 'repeat(3, minmax(0, 1fr))',
          xl: `repeat(${issue ? 5 : 6}, minmax(0, 1fr))`,
        }}
        gap
        alignItems="end"
      >
        {!issue && (
          <FormField name="status" label={t('status')}>
            <Select>
              <ListItem id="">{t('allStatuses')}</ListItem>
              {['unresolved', 'resolved', 'ignored'].map(status => (
                <ListItem key={status} id={status}>
                  {t(status)}
                </ListItem>
              ))}
            </Select>
          </FormField>
        )}
        {fields.map(key => (
          <FormField key={key} name={key} label={t(key)}>
            <TextField maxLength={key === 'urlPath' ? 500 : key === 'release' ? 100 : 50} />
          </FormField>
        ))}
        <FormSubmitButton>{t('apply')}</FormSubmitButton>
      </Grid>
    </Form>
  );
}

export function ErrorStats({
  data,
  startAt,
  endAt,
}: {
  data: {
    occurrences: number;
    visits: number;
    issues: number;
    series?: Array<{ date: string; occurrences: number }>;
  };
  startAt: number;
  endAt: number;
}) {
  const t = useTranslations('errorTracking');
  const { locale } = useLocale();
  const chartData = useMemo(() => {
    const counts = new Map((data.series || []).map(row => [row.date, row.occurrences]));
    const start = Math.floor(startAt / 86400000) * 86400000;
    const days = Math.max(1, Math.floor(endAt / 86400000) - Math.floor(startAt / 86400000) + 1);
    return {
      datasets: [
        {
          label: t('occurrences'),
          backgroundColor: CHART_COLORS[0],
          borderColor: CHART_COLORS[0],
          data: Array.from({ length: days }, (_, index) => {
            const date = new Date(start + index * 86400000).toISOString().slice(0, 10);
            // The API groups by UTC calendar day; preserve that day in the chart's local date labels.
            return { x: `${date}T00:00:00`, y: counts.get(date) || 0 };
          }),
        },
      ],
    };
  }, [data.series, startAt, endAt, t]);
  const renderXLabel = useMemo(() => renderDateLabels('day', locale), [locale]);

  return (
    <Column gap>
      <MetricsBar>
        {(['occurrences', 'visits', 'issues'] as const).map(key => (
          <MetricCard key={key} label={t(key)} value={data[key]} />
        ))}
      </MetricsBar>
      <Panel>
        <BarChart
          chartData={chartData}
          minDate={new Date(`${new Date(startAt).toISOString().slice(0, 10)}T00:00:00`)}
          maxDate={new Date(`${new Date(endAt).toISOString().slice(0, 10)}T00:00:00`)}
          unit="day"
          renderXLabel={renderXLabel}
          height="300px"
        />
      </Panel>
    </Column>
  );
}
