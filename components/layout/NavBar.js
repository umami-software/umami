import { useState } from 'react';
import { Icon, Text, Icons } from 'react-basics';
import classNames from 'classnames';
import { Dashboard, Logo, Profile, User, Users, Clock, Globe } from 'components/icons';
import NavGroup from './NavGroup';
import styles from './NavBar.module.css';
import ThemeButton from '../buttons/ThemeButton';
import LanguageButton from '../buttons/LanguageButton';

const { ChevronDown, Search } = Icons;

const analytics = [
  { label: 'Dashboard', url: '/dashboard', icon: <Dashboard /> },
  { label: 'Realtime', url: '/realtime', icon: <Clock /> },
  { label: 'Queries', url: '/queries', icon: <Search /> },
];

const settings = [
  { label: 'Websites', url: '/settings/websites', icon: <Globe /> },
  { label: 'Users', url: '/settings/users', icon: <User /> },
  { label: 'Teams', url: '/settings/teams', icon: <Users /> },
  { label: 'Profile', url: '/settings/profile', icon: <Profile /> },
];

export default function NavBar() {
  const [minimized, setMinimized] = useState(false);

  const handleMinimize = () => setMinimized(state => !state);

  return (
    <div className={classNames(styles.navbar, { [styles.minimized]: minimized })}>
      <div className={styles.header} onClick={handleMinimize}>
        <Icon size="lg">
          <Logo />
        </Icon>
        <Text className={styles.text}>umami</Text>
        <Icon size="sm" rotate={minimized ? -90 : 90} className={styles.icon}>
          <ChevronDown />
        </Icon>
      </div>
      <NavGroup title="Analytics" items={analytics} minimized={minimized} />
      <NavGroup title="Settings" items={settings} minimized={minimized} />
      <div className={styles.footer}>
        <div className={styles.buttons}>
          <ThemeButton />
          <LanguageButton />
        </div>
      </div>
    </div>
  );
}
