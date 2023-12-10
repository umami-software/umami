'use client';
import { usePathname } from 'next/navigation';
import useUser from 'components/hooks/useUser';
import useMessages from 'components/hooks/useMessages';
import SideNav from 'components/layout/SideNav';
import styles from './layout.module.css';

export default function SettingsLayout({ children }) {
  const { user } = useUser();
  const pathname = usePathname();
  const { formatMessage, labels } = useMessages();
  const cloudMode = !!process.env.cloudMode;

  const items = [
    { key: 'websites', label: formatMessage(labels.websites), url: '/settings/websites' },
    { key: 'teams', label: formatMessage(labels.teams), url: '/settings/teams' },
    user.isAdmin && { key: 'users', label: formatMessage(labels.users), url: '/settings/users' },
    { key: 'profile', label: formatMessage(labels.profile), url: '/settings/profile' },
  ].filter(n => n);

  const getKey = () => items.find(({ url }) => pathname === url)?.key;

  if (cloudMode && pathname !== '/settings/profile') {
    return null;
  }

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
