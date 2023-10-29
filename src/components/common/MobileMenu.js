import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './MobileMenu.module.css';

export function MobileMenu({ items = [], onClose }) {
  const pathname = usePathname();

  const Items = ({ items, className }) => (
    <div className={classNames(styles.items, className)}>
      {items.map(({ label, url, children }) => {
        const selected = pathname.startsWith(url);

        return (
          <>
            <Link
              key={url}
              href={url}
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

  return createPortal(
    <div className={classNames(styles.menu)}>
      <Items items={items} />
    </div>,
    document.body,
  );
}

export default MobileMenu;
