import { useState } from 'react';
import { Icon, Text, Icons } from 'react-basics';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './NavGroup.module.css';

export default function NavGroup({
  title,
  items,
  defaultExpanded = true,
  allowExpand = true,
  minimized = false,
}) {
  const { pathname } = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpand = () => setExpanded(state => !state);

  return (
    <div
      className={classNames(styles.group, {
        [styles.expanded]: expanded,
        [styles.minimized]: minimized,
      })}
    >
      {title && (
        <div className={styles.header} onClick={allowExpand ? handleExpand : undefined}>
          <Text>{title}</Text>
          <Icon size="sm" rotate={expanded ? 0 : -90}>
            <Icons.ChevronDown />
          </Icon>
        </div>
      )}
      <div className={styles.body}>
        {items.map(({ label, url, icon, divider }) => {
          return (
            <Link key={label} href={url}>
              <a
                className={classNames(styles.item, {
                  [styles.divider]: divider,
                  [styles.selected]: pathname.startsWith(url),
                })}
              >
                <Icon>{icon}</Icon>
                <Text className={styles.text}>{label}</Text>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
