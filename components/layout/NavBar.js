import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Icon, Text, Icons } from 'react-basics';
import classNames from 'classnames';
import { Dashboard, Logo, Profile, User, Users, Clock, Globe } from 'components/icons';
import ThemeButton from '../buttons/ThemeButton';
import LanguageButton from 'components/buttons/LanguageButton';
import LogoutButton from 'components/buttons/LogoutButton';
import { labels } from 'components/messages';
import NavGroup from './NavGroup';
import styles from './NavBar.module.css';

export default function NavBar() {
  const { formatMessage } = useIntl();
  const [minimized, setMinimized] = useState(false);
  const tooltipPosition = minimized ? 'right' : 'top';

  const analytics = [
    { label: formatMessage(labels.dashboard), url: '/dashboard', icon: <Dashboard /> },
    { label: formatMessage(labels.realtime), url: '/realtime', icon: <Clock /> },
    { label: formatMessage(labels.queries), url: '/queries', icon: <Icons.Search /> },
  ];

  const settings = [
    { label: formatMessage(labels.websites), url: '/settings/websites', icon: <Globe /> },
    { label: formatMessage(labels.users), url: '/settings/users', icon: <User /> },
    { label: formatMessage(labels.teams), url: '/settings/teams', icon: <Users /> },
    { label: formatMessage(labels.profile), url: '/settings/profile', icon: <Profile /> },
  ];

  const handleMinimize = () => setMinimized(state => !state);

  return (
    <div className={classNames(styles.navbar, { [styles.minimized]: minimized })}>
      <div className={styles.header} onClick={handleMinimize}>
        <Icon size="lg">
          <Logo />
        </Icon>
        <Text className={styles.text}>umami</Text>
        <Icon size="sm" rotate={minimized ? -90 : 90} className={styles.icon}>
          <Icons.ChevronDown />
        </Icon>
      </div>
      <NavGroup title={formatMessage(labels.analytics)} items={analytics} minimized={minimized} />
      <NavGroup title={formatMessage(labels.settings)} items={settings} minimized={minimized} />
      <div className={styles.footer}>
        <div className={styles.buttons}>
          <ThemeButton tooltipPosition={tooltipPosition} />
          <LanguageButton tooltipPosition={tooltipPosition} />
          <LogoutButton tooltipPosition={tooltipPosition} />
        </div>
      </div>
    </div>
  );
}
