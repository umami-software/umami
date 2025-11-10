import { ReactNode } from 'react';
import { FixedSizeList } from 'react-window';
import { useSpring, config } from '@react-spring/web';
import { Grid, Row, Column, Text } from '@umami/react-zen';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile } from '@/components/hooks';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

const ITEM_SIZE = 30;

interface ListData {
  label: string;
  count: number;
  percent: number;
}

export interface ListTableProps {
  data?: ListData[];
  title?: string;
  metric?: string;
  className?: string;
  renderLabel?: (data: ListData, index: number) => ReactNode;
  renderChange?: (data: ListData, index: number) => ReactNode;
  animate?: boolean;
  virtualize?: boolean;
  showPercentage?: boolean;
  itemCount?: number;
  currency?: string;
}

export function ListTable({
  data = [],
  title,
  metric,
  renderLabel,
  renderChange,
  animate = true,
  virtualize = false,
  showPercentage = true,
  itemCount = 10,
  currency,
}: ListTableProps) {
  const { formatMessage, labels } = useMessages();
  const { isPhone } = useMobile();

  const getRow = (row: ListData, index: number) => {
    const { label, count, percent } = row;

    return (
      <AnimatedRow
        key={`${label}${index}`}
        label={renderLabel ? renderLabel(row, index) : (label ?? formatMessage(labels.unknown))}
        value={count}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
        change={renderChange ? renderChange(row, index) : null}
        currency={currency}
        isPhone={isPhone}
      />
    );
  };

  const ListTableRow = ({ index, style }) => {
    return <div style={style}>{getRow(data[index], index)}</div>;
  };

  return (
    <Column gap>
      <Grid alignItems="center" justifyContent="space-between" paddingLeft="2" columns="1fr 100px">
        <Text weight="bold">{title}</Text>
        <Text weight="bold" align="center">
          {metric}
        </Text>
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

const AnimatedRow = ({
  label,
  value = 0,
  percent,
  change,
  animate,
  showPercentage = true,
  currency,
  isPhone,
}) => {
  const props = useSpring({
    width: percent,
    y: !isNaN(value) ? value : 0,
    from: { width: 0, y: 0 },
    config: animate ? config.default : { duration: 0 },
  });

  return (
    <Grid
      columns="1fr 50px 50px"
      paddingLeft="2"
      alignItems="center"
      hoverBackgroundColor="2"
      borderRadius
      gap
    >
      <Row alignItems="center">
        <Text truncate={true} style={{ maxWidth: isPhone ? '200px' : '400px' }}>
          {label}
        </Text>
      </Row>
      <Row alignItems="center" height="30px" justifyContent="flex-end">
        {change}
        <Text weight="bold">
          <AnimatedDiv title={props?.y as any}>
            {currency
              ? props.y?.to(n => formatLongCurrency(n, currency))
              : props.y?.to(formatLongNumber)}
          </AnimatedDiv>
        </Text>
      </Row>
      {showPercentage && (
        <Row
          alignItems="center"
          justifyContent="flex-start"
          position="relative"
          border="left"
          borderColor="8"
          color="muted"
          paddingLeft="3"
        >
          <AnimatedDiv>{props.width.to(n => `${n?.toFixed?.(0)}%`)}</AnimatedDiv>
        </Row>
      )}
    </Grid>
  );
};
