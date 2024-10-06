import { FixedSizeList } from 'react-window';
import { useSpring, animated, config } from '@react-spring/web';
import classNames from 'classnames';
import Empty from 'components/common/Empty';
import { formatLongNumberOptions } from 'lib/format';
import { useIntl } from 'react-intl';
import { useMessages } from 'components/hooks';
import styles from './ListTable.module.css';
import { ReactNode } from 'react';

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
}

export function ListTable({
  data = [],
  title,
  metric,
  className,
  renderLabel,
  renderChange,
  animate = true,
  virtualize = false,
  showPercentage = true,
  itemCount = 10,
}: ListTableProps) {
  const { formatMessage, labels } = useMessages();

  const getRow = (row: { x: any; y: any; z: any }, index: number) => {
    const { x: label, y: value, z: percent } = row;

    return (
      <AnimatedRow
        key={label}
        label={renderLabel ? renderLabel(row, index) : label ?? formatMessage(labels.unknown)}
        value={value}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
        change={renderChange ? renderChange(row, index) : null}
      />
    );
  };

  const Row = ({ index, style }) => {
    return <div style={style}>{getRow(data[index], index)}</div>;
  };

  return (
    <div className={classNames(styles.table, className)}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.metric}>{metric}</div>
      </div>
      <div className={styles.body}>
        {data?.length === 0 && <Empty className={styles.empty} />}
        {virtualize && data.length > 0 ? (
          <FixedSizeList
            width="100%"
            height={itemCount * ITEM_SIZE}
            itemCount={data.length}
            itemSize={ITEM_SIZE}
          >
            {Row}
          </FixedSizeList>
        ) : (
          data.map(getRow)
        )}
      </div>
    </div>
  );
}

const AnimatedRow = ({ label, value = 0, percent, change, animate, showPercentage = true }) => {
  const intl = useIntl();
  const props = useSpring({
    width: percent,
    y: value,
    from: { width: 0, y: 0 },
    config: animate ? config.default : { duration: 0 },
  });

  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {change}
        <animated.div
          className={styles.value}
          title={props?.y.to((n: number) => intl.formatNumber(n))}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {props.y?.to((n: number) => intl.formatNumber(n, formatLongNumberOptions(n)))}
        </animated.div>
      </div>
      {showPercentage && (
        <div className={styles.percent}>
          <animated.div className={styles.bar} style={{ width: props.width.to(n => `${n}%`) }} />
          <animated.span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {props.width.to(n => intl.formatNumber(n / 100, { style: 'percent' }))}
          </animated.span>
        </div>
      )}
    </div>
  );
};

export default ListTable;
