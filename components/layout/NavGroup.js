import { useState } from 'react';
import { Icon, Text, Tooltip } from 'react-basics';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Icons from 'components/icons';
import styles from './NavGroup.module.css';

export function NavGroup({
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
            <Tooltip key={label} label={label} position="right" disabled={!minimized}>
              <Link
                href={url}
                className={classNames(styles.item, {
                  [styles.divider]: divider,
                  [styles.selected]: pathname.startsWith(url),
                })}
              >
                <Icon>{icon}</Icon>
                <Text className={styles.text}>{label}</Text>
              </Link>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export default NavGroup;
