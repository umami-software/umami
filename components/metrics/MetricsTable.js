import React, { useState, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { FixedSizeList } from 'react-window';
import { useSpring, animated, config } from 'react-spring';
import classNames from 'classnames';
import Button from 'components/common/Button';
import Loading from 'components/common/Loading';
import NoData from 'components/common/NoData';
import useFetch from 'hooks/useFetch';
import Arrow from 'assets/arrow-right.svg';
import { percentFilter } from 'lib/filters';
import { formatNumber, formatLongNumber } from 'lib/format';
import useDateRange from 'hooks/useDateRange';
import styles from './MetricsTable.module.css';

export default function MetricsTable({
  websiteId,
  websiteDomain,
  token,
  title,
  metric,
  type,
  className,
  dataFilter,
  filterOptions,
  limit,
  renderLabel,
  onDataLoad = () => {},
  onExpand = () => {},
}) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const { data } = useFetch(
    `/api/website/${websiteId}/rankings`,
    {
      type,
      start_at: +startDate,
      end_at: +endDate,
      domain: websiteDomain,
      token,
    },
    { onDataLoad, delay: 300, update: [modified] },
  );
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

  return (
    <div className={classNames(styles.container, className)}>
      {!data && <Loading />}
      {data && (
        <>
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            <div className={styles.metric} onClick={handleSetFormat}>
              {metric}
            </div>
          </div>
          <div className={styles.body}>
            {rankings?.length === 0 && <NoData />}
            {limit
              ? rankings.map(row => getRow(row))
              : rankings.length > 0 && (
                  <FixedSizeList height={500} itemCount={rankings.length} itemSize={30}>
                    {Row}
                  </FixedSizeList>
                )}
          </div>
          <div className={styles.footer}>
            {limit && (
              <Button icon={<Arrow />} size="xsmall" onClick={() => onExpand(type)}>
                <div>
                  <FormattedMessage id="button.more" defaultMessage="More" />
                </div>
              </Button>
            )}
          </div>
        </>
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
