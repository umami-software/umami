'use client';
import { Icon, Text } from 'react-basics';
import Link from 'next/link';
import classNames from 'classnames';
import HamburgerButton from 'components/common/HamburgerButton';
import ThemeButton from 'components/input/ThemeButton';
import LanguageButton from 'components/input/LanguageButton';
import ProfileButton from 'components/input/ProfileButton';
import TeamsButton from 'components/input/TeamsButton';
import Icons from 'components/icons';
import { useLogin, useMessages, useNavigation, useTeamUrl } from 'components/hooks';
import styles from './NavBar.module.css';

export function NavBar() {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();
  const { teamId, renderTeamUrl } = useTeamUrl();

  const cloudMode = Boolean(process.env.cloudMode);

  const links = [
    { label: formatMessage(labels.dashboard), url: renderTeamUrl('/dashboard') },
    { label: formatMessage(labels.websites), url: renderTeamUrl('/websites') },
    { label: formatMessage(labels.reports), url: renderTeamUrl('/reports') },
    { label: formatMessage(labels.settings), url: renderTeamUrl('/settings') },
  ].filter(n => n);

  const menuItems = [
    {
      label: formatMessage(labels.dashboard),
      url: renderTeamUrl('/dashboard'),
    },
    !cloudMode && {
      label: formatMessage(labels.settings),
      url: renderTeamUrl('/settings'),
      children: [
        {
          label: formatMessage(labels.websites),
          url: '/settings/websites',
        },
        {
          label: formatMessage(labels.teams),
          url: '/settings/teams',
        },
        {
          label: formatMessage(labels.users),
          url: '/settings/users',
        },
        {
          label: formatMessage(labels.profile),
          url: '/profile',
        },
      ],
    },
    cloudMode && {
      label: formatMessage(labels.profile),
      url: '/profile',
    },
    !cloudMode && { label: formatMessage(labels.logout), url: '/logout' },
  ].filter(n => n);

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Icon size="lg">
          <Icons.Logo />
        </Icon>
        <Text>umami</Text>
      </div>
      <div className={styles.links}>
        {links.map(({ url, label }) => {
          return (
            <Link
              key={url}
              href={url}
              className={classNames({ [styles.selected]: pathname.startsWith(url) })}
              prefetch={url !== '/settings'}
            >
              <Text>{label}</Text>
            </Link>
          );
        })}
      </div>
      <div className={styles.actions}>
        {user?.teams?.length && <TeamsButton teamId={teamId} />}
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </div>
      <div className={styles.mobile}>
        <HamburgerButton menuItems={menuItems} />
      </div>
    </div>
  );
}

export default NavBar;
