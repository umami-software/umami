import { useState } from 'react';
import useMeasure from 'react-use-measure';
import { FixedSizeList } from 'react-window';
import { useSpring, animated, config } from 'react-spring';
import classNames from 'classnames';
import NoData from 'components/common/NoData';
import { formatNumber, formatLongNumber } from 'lib/format';
import styles from './DataTable.module.css';
import useMessages from '../../hooks/useMessages';

export function DataTable({
  data = [],
  title,
  metric,
  className,
  renderLabel,
  animate = true,
  virtualize = false,
  showPercentage = true,
}) {
  const { formatMessage, labels } = useMessages();
  const [ref, bounds] = useMeasure();
  const [format, setFormat] = useState(true);
  const formatFunc = format ? formatLongNumber : formatNumber;

  const handleSetFormat = () => setFormat(state => !state);

  const getRow = row => {
    const { x: label, y: value, z: percent } = row;

    return (
      <AnimatedRow
        key={label}
        label={renderLabel ? renderLabel(row) : label ?? formatMessage(labels.unknown)}
        value={value}
        percent={percent}
        animate={animate && !virtualize}
        format={formatFunc}
        onClick={handleSetFormat}
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
        <div className={styles.metric} onClick={handleSetFormat}>
          {metric}
        </div>
      </div>
      <div ref={ref} className={styles.body}>
        {data?.length === 0 && <NoData />}
        {virtualize && data.length > 0 ? (
          <FixedSizeList height={bounds.height} itemCount={data.length} itemSize={30}>
            {Row}
          </FixedSizeList>
        ) : (
          data.map(row => getRow(row))
        )}
      </div>
    </div>
  );
}

const AnimatedRow = ({
  label,
  value = 0,
  percent,
  animate,
  format,
  onClick,
  showPercentage = true,
}) => {
  const props = useSpring({
    width: percent,
    y: value,
    from: { width: 0, y: 0 },
    config: animate ? config.default : { duration: 0 },
  });

  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value} onClick={onClick}>
        <animated.div className={styles.value}>{props.y?.to(format)}</animated.div>
      </div>
      {showPercentage && (
        <div className={styles.percent}>
          <animated.div className={styles.bar} style={{ width: props.width.to(n => `${n}%`) }} />
          <animated.span className={styles.percentValue}>
            {props.width.to(n => `${n.toFixed(0)}%`)}
          </animated.span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
