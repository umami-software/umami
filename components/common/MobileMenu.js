import classNames from 'classnames';
import Link from 'next/link';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ items = [], onClose }) {
  return (
    <div className={classNames(styles.menu)}>
      <div className={styles.items}>
        {items.map(({ label, value }) => (
          <Link key={value} href={value} className={styles.item} onClick={onClose}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
