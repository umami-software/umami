import { config, useSpring } from '@react-spring/web';
import { Column, Focusable, Grid, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { FixedSizeList } from 'react-window';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import { Info } from 'lucide-react';

const ITEM_SIZE = 30;

interface ListData {
  label: string;
  count: number;
  percent: number;
}

export interface ListTableProps {
  data?: Array<ListData>;
  title?: string;
  metric?: string;
  metricToolTip?: string;
  className?: string;
  renderLabel?: (data: ListData, index: number) => ReactNode;
  renderChange?: (data: ListData, index: number) => ReactNode;
  animate?: boolean;
  virtualize?: boolean;
  showPercentage?: boolean;
  itemCount?: number;
  formatCount?: (n: number) => string;
}

export function ListTable({
  data = [],
  title,
  metric,
  metricToolTip,
  renderLabel,
  renderChange,
  animate = true,
  virtualize = false,
  showPercentage = true,
  itemCount = 10,
  formatCount,
}: ListTableProps) {
  const { t, labels } = useMessages();
  const { isPhone } = useMobile();

  const getRow = (row: ListData, index: number) => {
    const { label, count, percent } = row;

    return (
      <AnimatedRow
        key={`${label}${index}`}
        label={renderLabel ? renderLabel(row, index) : (label ?? t(labels.unknown))}
        value={count}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
        change={renderChange ? renderChange(row, index) : null}
        formatCount={formatCount}
        isPhone={isPhone}
      />
    );
  };

  const ListTableRow = ({ index, style }) => {
    return <div style={style}>{getRow(data[index], index)}</div>;
  };

  return (
    <Column gap>
      <Grid
        alignItems="center"
        justifyContent="space-between"
        paddingLeft="2"
        columns={'1fr 100px'}
      >
        <Text weight="bold">{title}</Text>
        <MetricColumn metric={metric} metricToolTip={metricToolTip} />
      </Grid>
      <Column gap="1">
        {data?.length === 0 && <Empty />}
        {virtualize && data.length > 0 ? (
          <FixedSizeList
            width="100%"
            height={itemCount * ITEM_SIZE}
            itemCount={data.length}
            itemSize={ITEM_SIZE}
          >
            {ListTableRow}
          </FixedSizeList>
        ) : (
          data.map(getRow)
        )}
      </Column>
    </Column>
  );
}

const MetricColumnLabel = ({ label }: { label?: ListTableProps['metric'] }) => (
  <Text weight="bold" align="center">
    {label}
  </Text>
);

const MetricColumn = ({
  metric,
  metricToolTip,
}: {
  metric?: ListTableProps['metric'];
  metricToolTip?: ListTableProps['metricToolTip'];
}) => {
  if (metricToolTip) {
    return (
      <Row gap="1" alignItems="center" justifyContent="center">
        <MetricColumnLabel label={metric} />
        <TooltipTrigger delay={0}>
          <Focusable>
            <Info size={16} />
          </Focusable>
          <Tooltip>{metricToolTip}</Tooltip>
        </TooltipTrigger>
      </Row>
    );
  }

  return <MetricColumnLabel label={metric} />;
};

const AnimatedRow = ({
  label,
  value = 0,
  percent,
  change,
  animate,
  showPercentage = true,
  formatCount,
  isPhone,
}) => {
  const props = useSpring({
    width: percent,
    y: !Number.isNaN(value) ? value : 0,
    from: { width: 0, y: 0 },
    config: animate ? config.default : { duration: 0 },
  });

  return (
    <Grid
      columns={showPercentage ? '1fr 50px 50px' : '1fr 100px'}
      paddingLeft="2"
      alignItems="center"
      borderRadius
      gap
      hover={{ backgroundColor: 'surface-sunken' }}
    >
      <Row alignItems="center">
        <Text truncate={true} style={{ maxWidth: isPhone ? '200px' : '400px' }}>
          {label}
        </Text>
      </Row>
      <Row
        alignItems="center"
        height="30px"
        justifyContent={showPercentage ? 'flex-end' : 'center'}
      >
        {change}
        <Text weight="bold">
          <AnimatedDiv title={props?.y as any}>
            {formatCount ? props.y?.to(formatCount) : props.y?.to(formatLongNumber)}
          </AnimatedDiv>
        </Text>
      </Row>
      {showPercentage && (
        <Row
          alignItems="center"
          justifyContent="flex-start"
          position="relative"
          border="left"
          borderColor="strong"
          color="muted"
          paddingLeft="3"
        >
          <AnimatedDiv>{props.width.to(n => `${n?.toFixed?.(0)}%`)}</AnimatedDiv>
        </Row>
      )}
    </Grid>
  );
};
