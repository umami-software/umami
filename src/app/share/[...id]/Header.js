'use client';
import { Icon, Text } from 'react-basics';
import Link from 'next/link';
import LanguageButton from 'components/input/LanguageButton';
import ThemeButton from 'components/input/ThemeButton';
import SettingsButton from 'components/input/SettingsButton';
import Icons from 'components/icons';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div>
        <Link href="https://umami.is" target="_blank" className={styles.title}>
          <Icon size="lg">
            <Icons.Logo />
          </Icon>
          <Text>umami</Text>
        </Link>
      </div>
      <div className={styles.buttons}>
        <ThemeButton tooltipPosition="bottom" />
        <LanguageButton tooltipPosition="bottom" menuPosition="bottom" />
        <SettingsButton />
      </div>
    </header>
  );
}

export default Header;
