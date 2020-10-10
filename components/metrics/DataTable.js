import React, { useState } from 'react';
import { FixedSizeList } from 'react-window';
import { useSpring, animated, config } from 'react-spring';
import classNames from 'classnames';
import NoData from 'components/common/NoData';
import { formatNumber, formatLongNumber } from 'lib/format';
import styles from './DataTable.module.css';

export default function DataTable({
  data,
  title,
  metric,
  className,
  limit,
  renderLabel,
  height = 400,
  animate = true,
}) {
  const [format, setFormat] = useState(true);
  const formatFunc = format ? formatLongNumber : formatNumber;

  const handleSetFormat = () => setFormat(state => !state);

  const getRow = row => {
    const { x: label, y: value, z: percent } = row;

    return (
      <AnimatedRow
        key={label}
        label={renderLabel ? renderLabel(row) : label}
        value={value}
        percent={percent}
        animate={animate}
        format={formatFunc}
        onClick={handleSetFormat}
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
      <div className={styles.body}>
        {data?.length === 0 && <NoData />}
        {limit
          ? data.map(row => getRow(row))
          : data.length > 0 && (
              <FixedSizeList height={height} itemCount={data.length} itemSize={30}>
                {Row}
              </FixedSizeList>
            )}
      </div>
    </div>
  );
}

const AnimatedRow = ({ label, value = 0, percent, animate, format, onClick }) => {
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
        <animated.div className={styles.value}>{props.y?.interpolate(format)}</animated.div>
      </div>
      <div className={styles.percent}>
        <animated.div
          className={styles.bar}
          style={{ width: props.width.interpolate(n => `${n}%`) }}
        />
        <animated.span className={styles.percentValue}>
          {props.width.interpolate(n => `${n.toFixed(0)}%`)}
        </animated.span>
      </div>
    </div>
  );
};
