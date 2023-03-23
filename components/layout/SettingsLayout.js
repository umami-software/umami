import AppLayout from './AppLayout';
import styles from './SettingsLayout.module.css';
import useMessages from 'hooks/useMessages';
import SideNav from './SideNav';

export default function SettingsLayout({ children }) {
  const { formatMessage, labels } = useMessages();

  const items = [
    { label: formatMessage(labels.websites), url: '/settings/websites' },
    { label: formatMessage(labels.teams), url: '/settings/teams' },
    { label: formatMessage(labels.users), url: '/settings/users' },
    { label: formatMessage(labels.profile), url: '/settings/profile' },
  ];

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.menu}>
          <SideNav items={items} />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </AppLayout>
  );
}
