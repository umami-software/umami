'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SideNav from 'components/layout/SideNav';
import styles from './SettingsLayout.module.css';

export function SettingsLayout({ items = [], children }: { items: any[]; children: ReactNode }) {
  const pathname = usePathname();
  const cloudMode = !!process.env.cloudMode;

  const getKey = () => items.find(({ url }) => pathname === url)?.key;

  return (
    <div className={styles.layout}>
      {!cloudMode && (
        <div className={styles.menu}>
          <SideNav items={items} shallow={true} selectedKey={getKey()} />
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default SettingsLayout;
