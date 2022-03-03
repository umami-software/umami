import Link from './Link';
import Button from './Button';
import XMark from 'assets/xmark.svg';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ items = [], onClose }) {
  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <Button className={styles.button} icon={<XMark />} onClick={onClose} />
      </div>
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
