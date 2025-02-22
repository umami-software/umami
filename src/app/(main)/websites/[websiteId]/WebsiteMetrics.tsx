import { useMessages, useSticky } from '@/components/hooks';
import WebsiteDateFilter from '@/components/input/WebsiteDateFilter';
import useStore, { setWebsiteDateCompare } from '@/store/websites';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { Dropdown, Item } from 'react-basics';
import WebsiteFilterButton from './WebsiteFilterButton';
import styles from './WebsiteMetrics.module.css';

export function WebsiteMetrics({
  websiteId,
  sticky,
  compareMode = false,
  showFilter = false,
  children,
}: {
  websiteId: string;
  sticky?: boolean;
  showChange?: boolean;
  compareMode?: boolean;
  showFilter?: boolean;
  children?: ReactNode;
}) {
  const { formatMessage, labels } = useMessages();
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const dateCompare = useStore(state => state[websiteId]?.dateCompare);

  const items = [
    { label: formatMessage(labels.previousPeriod), value: 'prev' },
    { label: formatMessage(labels.previousYear), value: 'yoy' },
  ];

  return (
    <div
      ref={ref}
      className={classNames(styles.container, {
        [styles.sticky]: sticky,
        [styles.isSticky]: sticky && isSticky,
      })}
    >
      <div>{children}</div>
      <div className={styles.actions}>
        {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
        <WebsiteDateFilter websiteId={websiteId} showAllTime={!compareMode} />
        {compareMode && (
          <div className={styles.vs}>
            <b>VS</b>
            <Dropdown
              className={styles.dropdown}
              items={items}
              value={dateCompare || 'prev'}
              renderValue={value => items.find(i => i.value === value)?.label}
              alignment="end"
              onChange={(value: any) => setWebsiteDateCompare(websiteId, value)}
            >
              {items.map(({ label, value }) => (
                <Item key={value}>{label}</Item>
              ))}
            </Dropdown>
          </div>
        )}
      </div>
    </div>
  );
}
