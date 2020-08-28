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
import Loading from '../common/Loading';

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
  renderLabel,
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
      type,
      start_at: +startDate,
      end_at: +endDate,
    });

    setData(data);
    onDataLoad(data);
  }

  const handleSetFormat = () => setFormat(state => !state);

  const getRow = row => {
    const { x: label, y: value, z: percent } = row;
    return (
      <AnimatedRow
        key={label}
        label={renderLabel ? renderLabel(row) : label}
        value={value}
        percent={percent}
        animate={shouldAnimate}
        format={formatFunc}
        onClick={handleSetFormat}
      />
    );
  };

  const Row = ({ index, style }) => {
    return <div style={style}>{getRow(rankings[index])}</div>;
  };

  useEffect(() => {
    if (websiteId) {
      loadData();
    }
  }, [websiteId, startDate, endDate, type]);

  return (
    <div className={classNames(styles.container, className)}>
      {data ? (
        <>
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            {headerComponent}
            <div className={styles.metric} onClick={handleSetFormat}>
              {metric}
            </div>
          </div>
          <div className={styles.body}>
            {limit
              ? rankings.map(row => getRow(row))
              : data?.length > 0 && (
                  <FixedSizeList height={500} itemCount={rankings.length} itemSize={30}>
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
        </>
      ) : (
        <Loading />
      )}
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
