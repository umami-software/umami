import { FixedSizeList } from 'react-window';
import { useSpring, animated, config } from '@react-spring/web';
import classNames from 'classnames';
import Empty from 'components/common/Empty';
import { formatLongNumber } from 'lib/format';
import useMessages from 'components/hooks/useMessages';
import styles from './ListTable.module.css';
import { ReactNode } from 'react';

const ITEM_SIZE = 30;

export interface ListTableProps {
  data?: any[];
  title?: string;
  metric?: string;
  className?: string;
  renderLabel?: (row: any) => ReactNode;
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
  animate = true,
  virtualize = false,
  showPercentage = true,
  itemCount = 10,
}: ListTableProps) {
  const { formatMessage, labels } = useMessages();

  const getRow = row => {
    const { x: label, y: value, z: percent } = row;

    return (
      <AnimatedRow
        key={label}
        label={renderLabel ? renderLabel(row) : label ?? formatMessage(labels.unknown)}
        value={value}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
      />
    );
  };

  const Row = ({ index, style }) => {
    return <div style={style}>{getRow(data[index])}</div>;
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
            height={itemCount * ITEM_SIZE}
            itemCount={data.length}
            itemSize={ITEM_SIZE}
          >
            {Row}
          </FixedSizeList>
        ) : (
          data.map(row => getRow(row))
        )}
      </div>
    </div>
  );
}

const AnimatedRow = ({ label, value = 0, percent, animate, showPercentage = true }) => {
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
        <animated.div className={styles.value} title={props?.y as any}>
          {props.y?.to(formatLongNumber)}
        </animated.div>
      </div>
      {showPercentage && (
        <div className={styles.percent}>
          <animated.div className={styles.bar} style={{ width: props.width.to(n => `${n}%`) }} />
          <animated.span className={styles.percentValue}>
            {props.width.to(n => `${n?.toFixed?.(0)}%`)}
          </animated.span>
        </div>
      )}
    </div>
  );
};

export default ListTable;
