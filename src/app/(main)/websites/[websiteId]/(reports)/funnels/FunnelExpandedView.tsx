import {
  Box,
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Row,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { ScrollableDialogContent } from '@/components/common/ScrollableDialogContent';
import { useFunnelTimesQuery, useMessages } from '@/components/hooks';
import { Clock, File, Maximize, X } from '@/components/icons';
import { FilterButtons } from '@/components/input/FilterButtons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
import type { FunnelResult } from '@/queries/sql/funnels/getFunnel';
import { FunnelBreakdown } from './FunnelBreakdown';
import { FunnelChart } from './FunnelChart';
import { FunnelStepLabel } from './FunnelStepLabel';
import { formatDuration, formatPercent } from './format';

type PercentMode = 'first' | 'previous';

// The bottleneck is the largest drop-off as a share of the previous step, not in visitors.
export function getBottleneckIndex(data: FunnelResult[]) {
  return data.reduce(
    (worst, step, index) =>
      index > 0 &&
      step.previous > 0 &&
      step.dropped > 0 &&
      (worst < 0 || step.dropoff > data[worst].dropoff)
        ? index
        : worst,
    -1,
  );
}

export function FunnelMaximizeButton({
  websiteId,
  id,
  name,
  data,
}: {
  websiteId: string;
  id: string;
  name: string;
  data: FunnelResult[];
}) {
  const { t, labels } = useMessages();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          delay={0}
          render={<Button size="icon" variant="ghost" onClick={() => setIsOpen(true)} />}
        >
          <Icon>
            <Maximize />
          </Icon>
        </TooltipTrigger>
        <TooltipContent>{t(labels.maximize)}</TooltipContent>
      </Tooltip>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <ScrollableDialogContent
          aria-label={name}
          showCloseButton={false}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 0,
            padding: '32px',
          }}
        >
          <FunnelExpandedView
            websiteId={websiteId}
            id={id}
            name={name}
            data={data}
            onClose={() => setIsOpen(false)}
          />
        </ScrollableDialogContent>
      </Dialog>
    </>
  );
}

function FunnelExpandedView({
  websiteId,
  id,
  name,
  data,
  onClose,
}: {
  websiteId: string;
  id: string;
  name: string;
  data: FunnelResult[];
  onClose: () => void;
}) {
  const { t, labels } = useMessages();
  const [mode, setMode] = useState<PercentMode>('first');
  const { data: times } = useFunnelTimesQuery({ websiteId, id });
  const first = data[0]?.visitors || 0;
  const last = data[data.length - 1]?.visitors || 0;
  // Two steps make both percent modes equal and the bottleneck trivial, so both are hidden.
  const hasMiddleSteps = data.length > 2;
  const bottleneck = hasMiddleSteps ? getBottleneckIndex(data) : -1;
  const cardCount = 2 + Number(bottleneck > 0) + Number(times?.total != null);

  return (
    <Column gap="6">
      <Row justifyContent="space-between" alignItems="center" gap>
        <Heading size="2xl">{name}</Heading>
        <Row alignItems="center" gap>
          {hasMiddleSteps && (
            <FilterButtons
              items={[
                { id: 'first', label: t(labels.fromFirstStep) },
                { id: 'previous', label: t(labels.fromPreviousStep) },
              ]}
              value={mode}
              onChange={value => setMode(value as PercentMode)}
            />
          )}
          <Button size="sm" variant="ghost" onClick={onClose} aria-label={t(labels.close)}>
            <Icon>
              <X />
            </Icon>
          </Button>
        </Row>
      </Row>
      {/* Two per row until there is room for every card's large value on one row. */}
      <MetricsBar columns={{ base: 'repeat(2, 1fr)', xl: `repeat(${cardCount}, 1fr)` }}>
        <MetricCard
          label={t(labels.conversionRate)}
          value={first ? last / first : 0}
          formatValue={formatPercent}
        />
        <MetricCard
          label={t(labels.visitors)}
          value={last}
          formatValue={n => `${formatLongNumber(first)} → ${formatLongNumber(n)}`}
        />
        {bottleneck > 0 && (
          // Not a MetricCard, so the step fits on the value line and the card keeps its height.
          <Column justifyContent="center" paddingX="6" paddingY="4" gap="2" minWidth="0">
            <Text weight="bold" wrap="nowrap">
              {t(labels.biggestDropoff)}
            </Text>
            <Row alignItems="baseline" gap="3" minWidth="0">
              <Text size="4xl" weight="bold" wrap="nowrap">
                {`-${formatPercent(data[bottleneck].dropoff)}`}
              </Text>
              <Row alignItems="center" gap="2" minWidth="0">
                <Icon size="sm" color="muted">
                  {data[bottleneck].type === 'path' ? <File /> : <Lightning />}
                </Icon>
                <Text color="muted" truncate title={data[bottleneck].value}>
                  {data[bottleneck].value}
                </Text>
              </Row>
            </Row>
          </Column>
        )}
        {times?.total != null && (
          <MetricCard
            label={t(labels.medianTimeToConvert)}
            value={times.total}
            formatValue={formatDuration}
          />
        )}
      </MetricsBar>
      <Column gap="2">
        {data.map((step, index) => {
          const { type, value, visitors, previous, dropped, dropoff, remaining } = step;
          const percent = mode === 'first' || index === 0 ? remaining : 1 - dropoff;

          return (
            // The drop label shares the step's columns so it centers on the funnel bars.
            <Grid
              key={index}
              columns="minmax(180px, 1fr) minmax(0, 3fr) minmax(120px, auto)"
              alignItems="center"
              gapX="6"
              gapY="2"
            >
              {index > 0 && previous > 0 && <Box />}
              {index > 0 && previous > 0 && (
                <Row justifyContent="center" alignItems="center" gap>
                  <ChangeLabel value={-dropped}>
                    {`${formatLongNumber(dropped)} (${formatPercent(dropoff)})`}
                  </ChangeLabel>
                  {times?.steps[index] != null && (
                    <Row alignItems="center" gap="1" title={t(labels.medianTimeToConvert)}>
                      <Icon size="sm" color="muted">
                        <Clock />
                      </Icon>
                      <Text color="muted">{formatDuration(times.steps[index])}</Text>
                    </Row>
                  )}
                </Row>
              )}
              {index > 0 && previous > 0 && <Box />}
              <FunnelStepLabel index={index} type={type} value={value} />
              <Row justifyContent="center">
                <Box
                  height="48px"
                  borderRadius
                  style={{
                    width: `${(remaining || 0) * 100}%`,
                    minWidth: visitors > 0 ? '2px' : 0,
                    background: 'var(--primary)',
                  }}
                />
              </Row>
              <Column alignItems="end">
                <Text weight="bold" size="3xl">
                  {formatPercent(percent || 0)}
                </Text>
                <Text color="muted" title={visitors.toString()} transform="lowercase">
                  {`${formatLongNumber(visitors)} ${t(labels.visitors)}`}
                </Text>
              </Column>
            </Grid>
          );
        })}
      </Column>
      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">{t(labels.breakdown)}</TabsTrigger>
          <TabsTrigger value="chart">{t(labels.conversionOverTime)}</TabsTrigger>
        </TabsList>
        <TabsContent value="breakdown">
          <FunnelBreakdown websiteId={websiteId} id={id} steps={data} mode={mode} />
        </TabsContent>
        <TabsContent value="chart">
          <FunnelChart websiteId={websiteId} id={id} />
        </TabsContent>
      </Tabs>
    </Column>
  );
}
