import { useState } from 'react';
import { Icon, Text, Icons } from 'react-basics';
import classNames from 'classnames';
import { Dashboard, Logo, Profile, User, Users, Clock, Globe } from 'components/icons';
import NavGroup from './NavGroup';
import styles from './NavBar.module.css';

const { ChevronDown, Search } = Icons;

const analytics = [
  { key: 'dashboard', label: 'Dashboard', url: '/dashboard', icon: <Dashboard /> },
  { key: 'realtime', label: 'Realtime', url: '/realtime', icon: <Clock /> },
  { key: 'queries', label: 'Queries', url: '/queries', icon: <Search /> },
];

const settings = [
  { key: 'websites', label: 'Websites', url: '/settings/websites', icon: <Globe /> },
  { key: 'users', label: 'Users', url: '/settings/users', icon: <User /> },
  { key: 'teams', label: 'Teams', url: '/settings/teams', icon: <Users /> },
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
        <Icon>
          <Profile />
        </Icon>
        <Text>Profile</Text>
      </div>
    </div>
  );
}
