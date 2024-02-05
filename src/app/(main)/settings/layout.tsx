'use client';
import { usePathname } from 'next/navigation';
import { useLogin, useMessages, useTeamUrl } from 'components/hooks';
import SideNav from 'components/layout/SideNav';
import styles from './layout.module.css';

export default function SettingsLayout({ children }) {
  const { user } = useLogin();
  const pathname = usePathname();
  const { formatMessage, labels } = useMessages();
  const cloudMode = !!process.env.cloudMode;
  const { teamId, renderTeamUrl } = useTeamUrl();

  const items = [
    teamId && {
      key: 'team',
      label: formatMessage(labels.team),
      url: renderTeamUrl('/settings/team'),
    },
    teamId && {
      key: 'members',
      label: formatMessage(labels.members),
      url: renderTeamUrl('/settings/members'),
    },
    {
      key: 'websites',
      label: formatMessage(labels.websites),
      url: renderTeamUrl('/settings/websites'),
    },
    !teamId && { key: 'teams', label: formatMessage(labels.teams), url: '/settings/teams' },
    !teamId &&
      user.isAdmin && {
        key: 'users',
        label: formatMessage(labels.users),
        url: renderTeamUrl('/settings/users'),
      },
    !teamId && { key: 'profile', label: formatMessage(labels.profile), url: '/settings/profile' },
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
