import {
  Button,
  Column,
  Dialog,
  DialogContent,
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
import { useGoalChartQuery, useGoalSummaryQuery, useMessages } from '@/components/hooks';
import { File, Maximize, X } from '@/components/icons';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
import type { GoalResult } from '@/queries/sql/goals/getGoal';
import { ConversionChart } from '../funnels/FunnelChart';
import { formatDuration, formatPercent } from '../funnels/format';
import { GoalBreakdown } from './GoalBreakdown';

interface GoalViewProps {
  websiteId: string;
  id: string;
  name: string;
  type: string;
  value: string;
  data: GoalResult;
}

export function GoalMaximizeButton(props: GoalViewProps) {
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
        <DialogContent
          aria-label={props.name}
          showCloseButton={false}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 0,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          <GoalExpandedView {...props} onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function GoalExpandedView({
  websiteId,
  id,
  name,
  type,
  value,
  data,
  onClose,
}: GoalViewProps & { onClose: () => void }) {
  const { t, labels } = useMessages();
  const { data: summary } = useGoalSummaryQuery({ websiteId, id });
  const num = Number(data.num) || 0;
  const total = Number(data.total) || 0;
  const cardCount = 2 + Number(!!summary) + Number(summary?.median != null);

  return (
    <Column gap="6">
      <Row justifyContent="space-between" alignItems="center" gap>
        <Column gap="2" minWidth="0">
          <Heading size="2xl">{name}</Heading>
          <Row alignItems="center" gap="2" minWidth="0">
            <Icon size="sm" color="muted">
              {type === 'path' ? <File /> : <Lightning />}
            </Icon>
            <Text color="muted" truncate title={value}>
              {value}
            </Text>
          </Row>
        </Column>
        <Button size="sm" variant="ghost" onClick={onClose} aria-label={t(labels.close)}>
          <Icon>
            <X />
          </Icon>
        </Button>
      </Row>
      {/* Two per row until there is room for every card's large value on one row. */}
      <MetricsBar columns={{ base: 'repeat(2, 1fr)', xl: `repeat(${cardCount}, 1fr)` }}>
        <MetricCard
          label={t(labels.conversionRate)}
          value={total ? num / total : 0}
          formatValue={formatPercent}
        />
        <MetricCard
          label={t(labels.visitors)}
          value={num}
          formatValue={n => `${formatLongNumber(total)} → ${formatLongNumber(n)}`}
        />
        {summary && (
          // Not a MetricCard, so the per-visitor average fits on the value line.
          <Column justifyContent="center" paddingX="6" paddingY="4" gap="2" minWidth="0">
            <Text weight="bold" wrap="nowrap">
              {t(labels.completions)}
            </Text>
            <Row alignItems="baseline" gap="3" minWidth="0">
              <Text size="4xl" weight="bold" wrap="nowrap" title={summary.completions.toString()}>
                {formatLongNumber(summary.completions)}
              </Text>
              {num > 0 && (
                <Text color="muted" wrap="nowrap">
                  {`${Number((summary.completions / num).toFixed(1))} ${t(labels.perVisitor)}`}
                </Text>
              )}
            </Row>
          </Column>
        )}
        {summary?.median != null && (
          <MetricCard
            label={t(labels.medianTimeToConvert)}
            value={summary.median}
            formatValue={formatDuration}
          />
        )}
      </MetricsBar>
      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">{t(labels.breakdown)}</TabsTrigger>
          <TabsTrigger value="chart">{t(labels.conversionOverTime)}</TabsTrigger>
        </TabsList>
        <TabsContent value="breakdown">
          <GoalBreakdown websiteId={websiteId} id={id} />
        </TabsContent>
        <TabsContent value="chart">
          <GoalChart websiteId={websiteId} id={id} />
        </TabsContent>
      </Tabs>
    </Column>
  );
}

// Its own component so the chart is only fetched once its tab opens.
function GoalChart({ websiteId, id }: { websiteId: string; id: string }) {
  return <ConversionChart {...useGoalChartQuery({ websiteId, id })} />;
}
