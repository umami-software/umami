import {
  Box,
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Modal,
  Row,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useFunnelTimesQuery, useMessages } from '@/components/hooks';
import { Clock, File, Maximize, X } from '@/components/icons';
import { FilterButtons } from '@/components/input/FilterButtons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { Lightning } from '@/components/svg';
import { formatLongNumber, formatShortTime } from '@/lib/format';
import type { FunnelResult } from '@/queries/sql/funnels/getFunnel';
import { FunnelBreakdown } from './FunnelBreakdown';
import { FunnelChart } from './FunnelChart';
import { FunnelStepLabel } from './FunnelStepLabel';

type PercentMode = 'first' | 'previous';

// Whole numbers, like the normal funnel view, so values don't change when maximized.
const formatPercent = (n: number) => `${Math.round(n * 100)}%`;

const formatDuration = (seconds: number) =>
  formatShortTime(Math.round(seconds), ['d', 'h', 'm', 's'], ' ').trim();

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
      <TooltipTrigger delay={0}>
        <Button size="sm" variant="quiet" onPress={() => setIsOpen(true)}>
          <Icon>
            <Maximize />
          </Icon>
        </Button>
        <Tooltip>{t(labels.maximize)}</Tooltip>
      </TooltipTrigger>
      <ControlledDialog>
        <Modal isOpen={isOpen} onOpenChange={setIsOpen} placement="fullscreen">
          <Dialog
            aria-label={name}
            style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
          >
            <FunnelExpandedView
              websiteId={websiteId}
              id={id}
              name={name}
              data={data}
              onClose={() => setIsOpen(false)}
            />
          </Dialog>
        </Modal>
      </ControlledDialog>
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
          <Button size="sm" variant="quiet" onPress={onClose} aria-label={t(labels.close)}>
            <Icon>
              <X />
            </Icon>
          </Button>
        </Row>
      </Row>
      <MetricsBar>
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
            <Column key={index} gap="2">
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
              <Grid
                columns={{
                  base: '1fr',
                  md: 'minmax(180px, 1fr) minmax(0, 3fr) minmax(120px, auto)',
                }}
                alignItems="center"
                gap="6"
              >
                <FunnelStepLabel index={index} type={type} value={value} />
                <Row justifyContent="center">
                  <Box
                    height="48px"
                    borderRadius
                    style={{
                      width: `${(remaining || 0) * 100}%`,
                      minWidth: visitors > 0 ? '2px' : 0,
                      background: 'var(--zen-primary)',
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
            </Column>
          );
        })}
      </Column>
      <Tabs defaultSelectedKey="breakdown">
        <TabList>
          <Tab id="breakdown">{t(labels.breakdown)}</Tab>
          <Tab id="chart">{t(labels.conversionOverTime)}</Tab>
        </TabList>
        <TabPanel id="breakdown">
          <FunnelBreakdown websiteId={websiteId} id={id} steps={data} mode={mode} />
        </TabPanel>
        <TabPanel id="chart">
          <FunnelChart websiteId={websiteId} id={id} />
        </TabPanel>
      </Tabs>
    </Column>
  );
}
