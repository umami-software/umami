import React, { useState, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import classNames from 'classnames';
import { get } from 'lib/web';
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
}) {
  const [data, setData] = useState();

  const rankings = useMemo(() => (data && dataFilter ? dataFilter(data) : data), [data]);

  const total = useMemo(() => rankings?.reduce((n, { y }) => n + y, 0) || 0, [rankings]);

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/rankings`, {
        start_at: +startDate,
        end_at: +endDate,
        type,
      }),
    );
  }

  useEffect(() => {
    if (websiteId) {
      loadData();
    }
  }, [websiteId, startDate, endDate, type]);

  if (!data) {
    return <h1>loading...</h1>;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.heading}>{heading}</div>
      </div>
      {rankings.map(({ x, y }, i) => (i <= 10 ? <Row label={x} value={y} total={total} /> : null))}
    </div>
  );
}

const Row = ({ label, value, total }) => {
  const props = useSpring({ width: (value / total) * 100, from: { width: 0 } });
  const valueProps = useSpring({ y: value, from: { y: 0 } });

  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <animated.div className={styles.value}>
        {valueProps.y.interpolate(y => y.toFixed(0))}
      </animated.div>
      <div className={styles.percent}>
        <animated.div>{props.width.interpolate(y => `${y.toFixed(0)}%`)}</animated.div>
        <animated.div className={styles.bar} style={{ ...props }} />
      </div>
    </div>
  );
};
