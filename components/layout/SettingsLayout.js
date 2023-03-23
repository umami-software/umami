import classNames from 'classnames';
import { useRouter } from 'next/router';
import AppLayout from './AppLayout';
import SideNav from './SideNav';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';
import styles from './SettingsLayout.module.css';

export default function SettingsLayout({ children }) {
  const { user } = useUser();
  const { pathname } = useRouter();
  const { formatMessage, labels } = useMessages();
  const { cloudMode } = useConfig();

  const items = [
    { key: 'websites', label: formatMessage(labels.websites), url: '/settings/websites' },
    { key: 'teams', label: formatMessage(labels.teams), url: '/settings/teams' },
    user.isAdmin && { key: 'users', label: formatMessage(labels.users), url: '/settings/users' },
    { key: 'profile', label: formatMessage(labels.profile), url: '/settings/profile' },
  ].filter(n => n);

  const getKey = () => items.find(({ url }) => pathname.startsWith(url))?.key;

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={classNames(styles.menu, { [styles.hidden]: cloudMode })}>
          <SideNav items={items} shallow={true} selectedKey={getKey()} />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </AppLayout>
  );
}
