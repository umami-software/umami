import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ items = [], onClose }) {
  const { pathname } = useRouter();

  const Items = ({ items, className }) => (
    <div className={classNames(styles.items, className)}>
      {items.map(({ label, value, children }) => {
        const selected = pathname === value;

        return (
          <>
            <Link
              key={value}
              href={value}
              className={classNames(styles.item, { [styles.selected]: selected })}
              onClick={onClose}
            >
              {label}
            </Link>
            {children && <Items items={children} className={styles.submenu} />}
          </>
        );
      })}
    </div>
  );

  return (
    <div className={classNames(styles.menu)}>
      <Items items={items} />
    </div>
  );
}
