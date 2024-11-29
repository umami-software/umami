import { format, startOfDay, addHours } from 'date-fns';
import { useLocale, useMessages, useWebsiteSessionsWeekly } from 'components/hooks';
import { LoadingPanel } from 'components/common/LoadingPanel';
import { getDayOfWeekAsDate } from 'lib/date';
import styles from './SessionsWeekly.module.css';
import classNames from 'classnames';
import { TooltipPopup } from 'react-basics';

export function SessionsWeekly({ websiteId }: { websiteId: string }) {
  const { data, ...props } = useWebsiteSessionsWeekly(websiteId);
  const { dateLocale } = useLocale();
  const { labels, formatMessage } = useMessages();

  const [, max] = data
    ? data.reduce((arr: number[], hours: number[], index: number) => {
        const min = Math.min(...hours);
        const max = Math.max(...hours);

        if (index === 0) {
          return [min, max];
        }

        if (min < arr[0]) {
          arr[0] = min;
        }

        if (max > arr[1]) {
          arr[1] = max;
        }

        return arr;
      }, [])
    : [];

  return (
    <LoadingPanel {...(props as any)} data={data}>
      <div key={data} className={styles.week}>
        <div className={styles.day}>
          <div className={styles.header}>&nbsp;</div>
          {Array(24)
            .fill(null)
            .map((_, i) => {
              const label = format(addHours(startOfDay(new Date()), i), 'haaa');
              return (
                <div key={i} className={styles.hour}>
                  {label}
                </div>
              );
            })}
        </div>
        {data?.map((day: number[], index: number) => {
          return (
            <div key={index} className={styles.day}>
              <div className={styles.header}>
                {format(getDayOfWeekAsDate(index), 'EEE', { locale: dateLocale })}
              </div>
              {day?.map((hour: number) => {
                const pct = hour / max;
                return (
                  <div key={hour} className={classNames(styles.cell)}>
                    {hour > 0 && (
                      <TooltipPopup
                        label={`${formatMessage(labels.visitors)}: ${hour}`}
                        position="right"
                      >
                        <div
                          className={styles.block}
                          style={{ opacity: pct, transform: `scale(${pct})` }}
                        />
                      </TooltipPopup>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </LoadingPanel>
  );
}

export default SessionsWeekly;
