import { ReactNode } from 'react';
import { FixedSizeList } from 'react-window';
import { useSpring, config } from '@react-spring/web';
import { Grid, Row, Column, Text } from '@umami/react-zen';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Empty } from '@/components/common/Empty';
import { useMessages } from '@/components/hooks';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

const ITEM_SIZE = 30;

export interface ListTableProps {
  data?: any[];
  title?: string;
  metric?: string;
  className?: string;
  renderLabel?: (row: any, index: number) => ReactNode;
  renderChange?: (row: any, index: number) => ReactNode;
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

  const getRow = (row: { x: any; y: any; z: any }, index: number) => {
    const { x: label, y: value, z: percent } = row || {};

    return (
      <AnimatedRow
        key={label}
        label={renderLabel ? renderLabel(row, index) : label ?? formatMessage(labels.unknown)}
        value={value}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
        change={renderChange ? renderChange(row, index) : null}
        currency={currency}
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
        <Text>{label}</Text>
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
