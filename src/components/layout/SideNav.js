import classNames from 'classnames';
import { Menu, Item } from 'react-basics';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './SideNav.module.css';

export function SideNav({
  selectedKey,
  items,
  shallow = true,
  scroll = false,
  className,
  onSelect = () => {},
}) {
  const pathname = usePathname();
  return (
    <Menu
      items={items}
      selectedKey={selectedKey}
      className={classNames(styles.menu, className)}
      onSelect={onSelect}
    >
      {({ key, label, url }) => (
        <Item
          key={key}
          className={classNames(styles.item, { [styles.selected]: pathname.startsWith(url) })}
        >
          <Link href={url} shallow={shallow} scroll={scroll}>
            {label}
          </Link>
        </Item>
      )}
    </Menu>
  );
}

export default SideNav;
