import { useState } from 'react';
import { Icon, Text } from 'react-basics';
import Link from 'next/link';
import classNames from 'classnames';
import Icons from 'components/icons';
import ThemeButton from 'components/input/ThemeButton';
import LanguageButton from 'components/input/LanguageButton';
import ProfileButton from 'components/input/ProfileButton';
import styles from './NavBar.module.css';
import useConfig from 'hooks/useConfig';
import useMessages from 'hooks/useMessages';

export default function NavBar() {
  const { cloudMode } = useConfig();
  const { formatMessage, labels } = useMessages();
  const [minimized, setMinimized] = useState(false);

  const links = [
    { label: formatMessage(labels.dashboard), url: '/dashboard', icon: <Icons.Dashboard /> },
    { label: formatMessage(labels.realtime), url: '/realtime', icon: <Icons.Clock /> },
    !cloudMode && { label: formatMessage(labels.settings), url: '/settings', icon: <Icons.Gear /> },
  ].filter(n => n);

  const handleMinimize = () => setMinimized(state => !state);

  return (
    <div className={classNames(styles.navbar, { [styles.minimized]: minimized })}>
      <div className={styles.logo} onClick={handleMinimize}>
        <Icon size="lg">
          <Icons.Logo />
        </Icon>
        <Text className={styles.text}>umami</Text>
      </div>
      <div className={styles.links}>
        {links.map(({ url, icon, label }) => {
          return (
            <Link key={url} href={url}>
              <Icon>{icon}</Icon>
              <Text>{label}</Text>
            </Link>
          );
        })}
      </div>
      <div className={styles.actions}>
        <ThemeButton />
        <LanguageButton />
        {!cloudMode && <ProfileButton />}
      </div>
    </div>
  );
}
