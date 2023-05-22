import { Row, Column } from 'react-basics';
import { useRouter } from 'next/router';
import SideNav from './SideNav';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';
import styles from './SettingsLayout.module.css';

export function SettingsLayout({ children }) {
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

  const getKey = () => items.find(({ url }) => pathname === url)?.key;

  return (
    <Row>
      {!cloudMode && (
        <Column className={styles.menu} defaultSize={12} md={4} lg={3} xl={2}>
          <SideNav items={items} shallow={true} selectedKey={getKey()} />
        </Column>
      )}
      <Column className={styles.content} defaultSize={12} md={8} lg={9} xl={10}>
        {children}
      </Column>
    </Row>
  );
}

export default SettingsLayout;
