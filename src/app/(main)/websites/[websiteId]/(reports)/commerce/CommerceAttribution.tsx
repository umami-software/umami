import { Column, Grid, Heading, ListItem, Row, Select, Text } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type CommerceScope,
  useCommerceAttributionQuery,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import {
  COMMERCE_ATTRIBUTION_MODELS,
  COMMERCE_LOOKBACK_DAYS,
  type CommerceAttributionDimension,
  type CommerceAttributionModel,
  type CommerceMetricType,
} from '@/lib/commerce-reports';
import { CommerceMetricLabel } from './CommerceMetricsTable';
import { currencyFormatter } from './commerceUtils';

export function CommerceAttribution({
  websiteId,
  scope,
}: {
  websiteId: string;
  scope: CommerceScope;
}) {
  const { t, labels } = useMessages();
  const { router, updateParams, query } = useNavigation();
  const model: CommerceAttributionModel = (
    COMMERCE_ATTRIBUTION_MODELS as readonly string[]
  ).includes(query.model)
    ? (query.model as CommerceAttributionModel)
    : 'last-click';
  const { data, isLoading, isFetching, error } = useCommerceAttributionQuery(websiteId, {
    ...scope,
    model,
  });
  const money = currencyFormatter(scope.currency);

  const panels: [CommerceAttributionDimension, string][][] = [
    [
      ['channel', t(labels.channels)],
      ['referrer', t(labels.referrers)],
    ],
    [
      ['paidAds', t('commerce.paidAds')],
      ['entry', t(labels.entry)],
    ],
    [
      ['utmSource', t(labels.utmSource)],
      ['utmMedium', t(labels.utmMedium)],
    ],
    [
      ['utmCampaign', t(labels.utmCampaign)],
      ['utmContent', t(labels.utmContent)],
    ],
  ];

  return (
    <Column gap>
      <Row justifyContent="space-between" alignItems="flex-end" wrap="wrap" gap>
        <Text color="muted" style={{ maxWidth: 720 }}>
          {t('commerce.attributionHint', { days: data?.lookbackDays ?? COMMERCE_LOOKBACK_DAYS })}
        </Text>
        <Select
          label={t(labels.model)}
          value={model}
          onChange={value =>
            router.replace(updateParams({ model: String(value) }), { scroll: false })
          }
          buttonProps={{ style: { width: 180 } }}
        >
          <ListItem id="first-click">{t(labels.firstClick)}</ListItem>
          <ListItem id="last-click">{t(labels.lastClick)}</ListItem>
        </Select>
      </Row>
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        {data && (
          <Column gap>
            {panels.map(row => (
              <GridRow key={row[0][0]} layout="two">
                {row.map(([dimension, title]) => {
                  const rows = data[dimension] || [];

                  return (
                    <Panel key={dimension}>
                      <Heading size="2xl">{title}</Heading>
                      <Grid padding="2">
                        <ListTable
                          title={title}
                          metric={t('commerce.revenue')}
                          formatCount={money}
                          data={rows.map(({ name, revenue }) => ({
                            label: name,
                            count: revenue,
                            percent: data.total.revenue ? (revenue / data.total.revenue) * 100 : 0,
                          }))}
                          renderLabel={(item: any) =>
                            dimension === 'paidAds' ? (
                              item.label
                            ) : (
                              <CommerceMetricLabel
                                type={dimension as CommerceMetricType}
                                data={item}
                              />
                            )
                          }
                        />
                      </Grid>
                    </Panel>
                  );
                })}
              </GridRow>
            ))}
          </Column>
        )}
      </LoadingPanel>
    </Column>
  );
}
