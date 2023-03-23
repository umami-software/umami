import { Menu, Item } from 'react-basics';
import Link from 'next/link';
import styles from './SideNav.module.css';

export default function SideNav({ selectedKey, items, shallow }) {
  return (
    <Menu items={items} selectedKey={selectedKey} className={styles.menu}>
      {({ key, label, url }) => (
        <Item key={key} className={styles.item}>
          <Link href={url} shallow={shallow}>
            {label}
          </Link>
        </Item>
      )}
    </Menu>
  );
}
