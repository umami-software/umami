import Logo from 'assets/logo.svg';
import HamburgerButton from 'components/common/HamburgerButton';
import Link from 'components/common/Link';
import UpdateNotice from 'components/common/UpdateNotice';
import LanguageButton from 'components/settings/LanguageButton';
import ThemeButton from 'components/settings/ThemeButton';
import UserButton from 'components/settings/UserButton';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';
import { HOMEPAGE_URL } from 'lib/constants';
import { useRouter } from 'next/router';
import { Column, Icon, Row } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import SettingsButton from '../settings/SettingsButton';
import styles from './Header.module.css';

export default function Header() {
  const { user } = useUser();
  const { pathname } = useRouter();
  const { updatesDisabled, adminDisabled } = useConfig();
  const isSharePage = pathname.includes('/share/');
  const allowUpdate = user?.isAdmin && !updatesDisabled && !isSharePage;

  return (
    <>
      {allowUpdate && <UpdateNotice />}
      <header className={styles.header}>
        <Row>
          <Column className={styles.title}>
            <Icon size="lg" className={styles.logo}>
              <Logo />
            </Icon>
            <Link href={isSharePage ? HOMEPAGE_URL : '/'}>umami</Link>
          </Column>
          <HamburgerButton />
          {user && !adminDisabled && (
            <div className={styles.links}>
              <Link href="/dashboard">
                <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />
              </Link>
              <Link href="/realtime">
                <FormattedMessage id="label.realtime" defaultMessage="Realtime" />
              </Link>
              <Link href="/websites">
                <FormattedMessage id="label.settings" defaultMessage="Settings" />
              </Link>
            </div>
          )}
          <Column className={styles.buttons}>
            <ThemeButton />
            <LanguageButton menuAlign="right" />
            <SettingsButton />
            {user && !adminDisabled && <UserButton />}
          </Column>
        </Row>
      </header>
    </>
  );
}
