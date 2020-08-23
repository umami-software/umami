import React, { useState, useEffect, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import { useSpring, animated, config } from 'react-spring';
import classNames from 'classnames';
import Button from 'components/common/Button';
import Arrow from 'assets/arrow-right.svg';
import { get } from 'lib/web';
import { percentFilter } from 'lib/filters';
import { formatNumber, formatLongNumber } from 'lib/format';
import styles from './MetricsTable.module.css';

export default function MetricsTable({
  title,
  metric,
  websiteId,
  startDate,
  endDate,
  type,
  className,
  dataFilter,
  filterOptions,
  limit,
  headerComponent,
  onDataLoad = () => {},
  onExpand = () => {},
}) {
  const [data, setData] = useState();
  const [format, setFormat] = useState(true);
  const formatFunc = format ? formatLongNumber : formatNumber;
  const shouldAnimate = limit > 0;

  const rankings = useMemo(() => {
    if (data) {
      const items = percentFilter(dataFilter ? dataFilter(data, filterOptions) : data);
      if (limit) {
        return items.filter((e, i) => i < limit);
      }
      return items;
    }
    return [];
  }, [data, dataFilter, filterOptions]);

  async function loadData() {
    const data = await get(`/api/website/${websiteId}/rankings`, {
      start_at: +startDate,
      end_at: +endDate,
      type,
    });

    setData(data);
    onDataLoad(data);
  }

  function handleSetFormat() {
    setFormat(state => !state);
  }

  function getRow(x, y, z) {
    return (
      <AnimatedRow
        key={x}
        label={x}
        value={y}
        percent={z}
        animate={shouldAnimate}
        format={formatFunc}
        onClick={handleSetFormat}
      />
    );
  }

  const Row = ({ index, style }) => {
    const { x, y, z } = rankings[index];
    return <div style={style}>{getRow(x, y, z)}</div>;
  };

  useEffect(() => {
    if (websiteId) {
      loadData();
    }
  }, [websiteId, startDate, endDate, type]);

  if (!data) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {headerComponent}
        <div className={styles.metric} onClick={handleSetFormat}>
          {metric}
        </div>
      </div>
      <div className={styles.body}>
        {limit ? (
          rankings.map(({ x, y, z }) => getRow(x, y, z))
        ) : (
          <FixedSizeList height={600} itemCount={rankings.length} itemSize={30}>
            {Row}
          </FixedSizeList>
        )}
      </div>
      <div className={styles.footer}>
        {limit && data.length > limit && (
          <Button icon={<Arrow />} size="xsmall" onClick={() => onExpand(type)}>
            <div>More</div>
          </Button>
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
      <div className={styles.label}>{decodeURI(label)}</div>
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
