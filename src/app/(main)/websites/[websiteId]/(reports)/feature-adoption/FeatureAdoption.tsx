'use client';
import { Column, Grid, Text } from '@umami/react-zen';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useFeatureAdoptionQuery, useLocale, useMessages } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';

export interface FeatureAdoptionProps {
  websiteId: string;
  feature?: string;
  successEvent?: string;
  window?: number;
}

export function FeatureAdoption({
  websiteId,
  feature,
  successEvent,
  window,
}: FeatureAdoptionProps) {
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const { data, error, isLoading } = useFeatureAdoptionQuery(
    { websiteId, feature: feature ?? '', successEvent, window },
    { enabled: !!feature },
  );

  if (!feature) {
    return (
      <Panel title={t(labels.featureAdoptionTitle)} description={t(labels.featureAdoptionDescription)}>
        <Empty />
      </Panel>
    );
  }

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Column gap>
          <Grid columns="repeat(4, minmax(0, 1fr))" gap>
            <Stat
              label={t(labels.adoptionRate)}
              value={`${Number(data.adoptionRate).toFixed(1)}%`}
            />
            <Stat label={t(labels.visitors)} value={formatLongNumber(data.featureUsers)} />
            <Stat label={t(labels.newUsers)} value={formatLongNumber(data.newUsers)} />
            <Stat label={t(labels.returningUsers)} value={formatLongNumber(data.returningUsers)} />
          </Grid>
          {data.successEvent && (
            <Grid columns="repeat(4, minmax(0, 1fr))" gap>
              <Stat label={t(labels.visitors)} value={formatLongNumber(data.activeUsers)} />
              <Stat label={t(labels.successEvent)} value={data.successEvent} />
              <Stat
                label={t(labels.conversionRate)}
                value={`${Number(data.completionRate).toFixed(1)}%`}
              />
              <Stat label={t(labels.conversion)} value={formatLongNumber(data.completedUsers)} />
            </Grid>
          )}
          <Panel title={t(labels.featureAdoptionTitle)} description={data.feature}>
            <Grid columns="repeat(4, minmax(0, 1fr))" gap>
              <Text weight="bold">{t(labels.date)}</Text>
              <Text weight="bold">{t(labels.visitors)}</Text>
              <Text weight="bold">{t(labels.newUsers)}</Text>
              <Text weight="bold">{t(labels.returningUsers)}</Text>
              {data.series.flatMap(item => [
                <Text key={`${item.date}-d`}>{formatDate(item.date, 'PP', locale)}</Text>,
                <Text key={`${item.date}-f`}>{formatLongNumber(item.featureUsers)}</Text>,
                <Text key={`${item.date}-n`}>{formatLongNumber(item.newUsers)}</Text>,
                <Text key={`${item.date}-r`}>{formatLongNumber(item.returningUsers)}</Text>,
              ])}
            </Grid>
          </Panel>
        </Column>
      )}
    </LoadingPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Panel>
      <Column gap="1">
        <Text color="muted">{label}</Text>
        <Text weight="bold">{value}</Text>
      </Column>
    </Panel>
  );
}
