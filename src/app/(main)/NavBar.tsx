'use client';
import { Icon, Text } from 'react-basics';
import Link from 'next/link';
import classNames from 'classnames';
import Icons from 'components/icons';
import ThemeButton from 'components/input/ThemeButton';
import LanguageButton from 'components/input/LanguageButton';
import ProfileButton from 'components/input/ProfileButton';
import useMessages from 'components/hooks/useMessages';
import HamburgerButton from 'components/common/HamburgerButton';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';

export function NavBar() {
  const pathname = usePathname();
  const { formatMessage, labels } = useMessages();
  const cloudMode = Boolean(process.env.cloudMode);

  const links = [
    { label: formatMessage(labels.dashboard), url: '/dashboard' },
    { label: formatMessage(labels.websites), url: '/websites' },
    { label: formatMessage(labels.reports), url: '/reports' },
    { label: formatMessage(labels.settings), url: '/settings' },
  ].filter(n => n);

  const menuItems = [
    {
      label: formatMessage(labels.dashboard),
      url: '/dashboard',
    },
    !cloudMode && {
      label: formatMessage(labels.settings),
      url: '/settings',
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
          url: '/settings/profile',
        },
      ],
    },
    cloudMode && {
      label: formatMessage(labels.profile),
      url: '/settings/profile',
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
            >
              <Text>{label}</Text>
            </Link>
          );
        })}
      </div>
      <div className={styles.actions}>
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
