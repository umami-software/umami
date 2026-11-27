import { Column, Grid, Row, Skeleton, Text } from '@umami/react-zen';
import { useSpring, useTransform } from 'motion/react';
import { type ReactNode, useEffect } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile } from '@/components/hooks';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { formatLongNumber } from '@/lib/format';

const ITEM_SIZE = 30;
// Varied label widths so placeholder rows read as a list rather than a block.
const SKELETON_LABEL_WIDTHS = [
  '70%',
  '55%',
  '62%',
  '48%',
  '66%',
  '52%',
  '58%',
  '44%',
  '60%',
  '50%',
];

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
  formatCount?: (n: number) => string;
  /** Shows placeholder rows in place of the data, keeping the header. */
  loading?: boolean;
  /** Number of placeholder rows while `loading` (default: 10). */
  loadingRows?: number;
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
  formatCount,
  loading = false,
  loadingRows = 10,
}: ListTableProps) {
  const { t, labels } = useMessages();
  const { isPhone } = useMobile();
  const reducedMotion = useReducedMotion();

  const getRow = (row: ListData, index: number) => {
    const { label, count, percent } = row;

    return (
      <AnimatedRow
        key={`${label}${index}`}
        label={renderLabel ? renderLabel(row, index) : (label ?? t(labels.unknown))}
        value={count}
        percent={percent}
        animate={animate && !virtualize && !reducedMotion}
        showPercentage={showPercentage}
        change={renderChange ? renderChange(row, index) : null}
        formatCount={formatCount}
        isPhone={isPhone}
      />
    );
  };

  const ListTableRow = ({ index, style }: RowComponentProps) => {
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
        <Text weight="medium" color="muted">
          {title}
        </Text>
        <Text weight="medium" color="muted" align="center">
          {metric}
        </Text>
      </Grid>
      <Column gap="1">
        {loading ? (
          Array.from({ length: loadingRows }, (_, index) => (
            <SkeletonRow key={index} index={index} showPercentage={showPercentage} />
          ))
        ) : data?.length === 0 ? (
          <Empty />
        ) : virtualize ? (
          <List
            style={{ width: '100%', height: itemCount * ITEM_SIZE }}
            defaultHeight={itemCount * ITEM_SIZE}
            rowCount={data.length}
            rowHeight={ITEM_SIZE}
            rowComponent={ListTableRow}
            rowProps={{}}
          />
        ) : (
          data.map(getRow)
        )}
      </Column>
    </Column>
  );
}

function SkeletonRow({ index, showPercentage }: { index: number; showPercentage: boolean }) {
  return (
    <Grid
      data-test="list-skeleton-row"
      columns={showPercentage ? '1fr 50px 50px' : '1fr 100px'}
      paddingLeft="2"
      alignItems="center"
      gap
      style={{ height: ITEM_SIZE }}
    >
      <Skeleton
        style={{
          width: SKELETON_LABEL_WIDTHS[index % SKELETON_LABEL_WIDTHS.length],
          height: 14,
        }}
      />
      <Row justifyContent={showPercentage ? 'flex-end' : 'center'}>
        <Skeleton style={{ width: 32, height: 14 }} />
      </Row>
      {showPercentage && (
        <Row paddingLeft="3" border="left" borderColor="input" height="100%" alignItems="center">
          <Skeleton style={{ width: 28, height: 14 }} />
        </Row>
      )}
    </Grid>
  );
}

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
  const y = !Number.isNaN(value) ? value : 0;
  const ySpring = useSpring(0, { stiffness: 170, damping: 26 });
  const widthSpring = useSpring(0, { stiffness: 170, damping: 26 });
  const yText = useTransform(ySpring, n => (formatCount ? formatCount(n) : formatLongNumber(n)));
  const widthText = useTransform(widthSpring, n => `${n?.toFixed?.(0)}%`);

  useEffect(() => {
    if (animate) {
      ySpring.set(y);
      widthSpring.set(percent);
    } else {
      ySpring.jump(y);
      widthSpring.jump(percent);
    }
  }, [y, percent, animate, ySpring, widthSpring]);

  return (
    <Grid
      columns={showPercentage ? '1fr 50px 50px' : '1fr 100px'}
      paddingLeft="2"
      alignItems="center"
      borderRadius
      gap
      hover={{ backgroundColor: 'muted' }}
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
          <AnimatedDiv title={String(value)}>
            {animate ? yText : formatCount ? formatCount(y) : formatLongNumber(y)}
          </AnimatedDiv>
        </Text>
      </Row>
      {showPercentage && (
        <Row
          alignItems="center"
          justifyContent="flex-start"
          position="relative"
          border="left"
          borderColor="input"
          color="muted"
          paddingLeft="3"
        >
          <AnimatedDiv>{animate ? widthText : `${percent?.toFixed?.(0)}%`}</AnimatedDiv>
        </Row>
      )}
    </Grid>
  );
};
