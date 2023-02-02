import classNames from 'classnames';
import Link from 'next/link';
import { Button, Icon } from 'react-basics';
import Icons from 'components/icons';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ items = [], onClose }) {
  return (
    <div className={classNames(styles.menu)}>
      <div className={styles.header}>
        <Button onClick={onClose}>
          <Icon>
            <Icons.Close />
          </Icon>
        </Button>
      </div>
      <div className={styles.items}>
        {items.map(({ label, value }) => (
          <Link key={value} href={value}>
            <a className={styles.item} onClick={onClose}>
              {label}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
