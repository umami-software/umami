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
import { useMessages, useNavigation, useTeamUrl } from 'components/hooks';
import styles from './NavBar.module.css';
import { useEffect } from 'react';
import { getItem, setItem } from 'next-basics';

export function NavBar() {
  const { formatMessage, labels } = useMessages();
  const { pathname, router } = useNavigation();
  const { teamId, renderTeamUrl } = useTeamUrl();

  const cloudMode = !!process.env.cloudMode;

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
        ...(teamId
          ? [
              {
                label: formatMessage(labels.team),
                url: renderTeamUrl('/settings/team'),
              },
            ]
          : []),
        {
          label: formatMessage(labels.websites),
          url: renderTeamUrl('/settings/websites'),
        },
        ...(!teamId
          ? [
              {
                label: formatMessage(labels.teams),
                url: renderTeamUrl('/settings/teams'),
              },
              {
                label: formatMessage(labels.users),
                url: '/settings/users',
              },
            ]
          : [
              {
                label: formatMessage(labels.members),
                url: renderTeamUrl('/settings/members'),
              },
            ]),
      ],
    },
    {
      label: formatMessage(labels.profile),
      url: '/profile',
    },
    !cloudMode && { label: formatMessage(labels.logout), url: '/logout' },
  ].filter(n => n);

  const handleTeamChange = (teamId: string) => {
    const url = teamId ? `/teams/${teamId}` : '/';
    if (!cloudMode) {
      setItem('umami.team', { id: teamId });
    }
    router.push(cloudMode ? `${process.env.cloudUrl}${url}` : url);
  };

  useEffect(() => {
    if (!cloudMode) {
      const teamIdLocal = getItem('umami.team')?.id;

      if (teamIdLocal && teamIdLocal !== teamId) {
        router.push(
          pathname !== '/' && pathname !== '/dashboard' ? '/' : `/teams/${teamIdLocal}/dashboard`,
        );
      }
    }
  }, [cloudMode]);

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
        <TeamsButton onChange={handleTeamChange} />
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </div>
      <div className={styles.mobile}>
        <TeamsButton onChange={handleTeamChange} showText={false} />
        <HamburgerButton menuItems={menuItems} />
      </div>
    </div>
  );
}

export default NavBar;
