import React, { useState, useEffect, useMemo } from 'react';
import { useSpring, animated, config } from 'react-spring';
import classNames from 'classnames';
import CheckVisible from './CheckVisible';
import { get } from 'lib/web';
import { percentFilter } from 'lib/filters';
import styles from './RankingsChart.module.css';

export default function RankingsChart({
  title,
  websiteId,
  startDate,
  endDate,
  type,
  heading,
  className,
  dataFilter,
  onDataLoad = () => {},
}) {
  const [data, setData] = useState();

  const rankings = useMemo(() => {
    if (data) {
      return (dataFilter ? dataFilter(data) : data).filter((e, i) => i < 10);
    }
    return [];
  }, [data]);

  async function loadData() {
    const data = await get(`/api/website/${websiteId}/rankings`, {
      start_at: +startDate,
      end_at: +endDate,
      type,
    });

    const updated = percentFilter(data);

    setData(updated);
    onDataLoad(updated);
  }

  useEffect(() => {
    if (websiteId) {
      loadData();
    }
  }, [websiteId, startDate, endDate, type]);

  if (!data) {
    return null;
  }

  return (
    <CheckVisible>
      {visible => (
        <div className={classNames(styles.container, className)}>
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            <div className={styles.heading}>{heading}</div>
          </div>
          <div className={styles.body}>
            {rankings.map(({ x, y, z }) => (
              <Row key={x} label={x} value={y} percent={z} animate={visible} />
            ))}
          </div>
        </div>
      )}
    </CheckVisible>
  );
}

const Row = ({ label, value, percent, animate }) => {
  const props = useSpring({
    width: percent,
    y: value,
    from: { width: 0, y: 0 },
    config: animate ? config.default : { duration: 0 },
  });

  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <animated.div className={styles.value}>{props.y.interpolate(n => n.toFixed(0))}</animated.div>
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
