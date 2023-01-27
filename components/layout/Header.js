import { useRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Link from 'components/common/Link';
import Icon from 'components/common/Icon';
import LanguageButton from 'components/settings/LanguageButton';
import ThemeButton from 'components/settings/ThemeButton';
import HamburgerButton from 'components/common/HamburgerButton';
import UpdateNotice from 'components/common/UpdateNotice';
import UserButton from 'components/settings/UserButton';
import { HOMEPAGE_URL } from 'lib/constants';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';
import Logo from 'assets/logo.svg';
import styles from './Header.module.css';

export default function Header() {
  const { user } = useUser();
  const { pathname } = useRouter();
  const { updatesDisabled } = useConfig();
  const isSharePage = pathname.includes('/share/');
  const allowUpdate = user?.isAdmin && !updatesDisabled && !isSharePage;

  return (
    <>
      {allowUpdate && <UpdateNotice />}
      <header className={classNames(styles.header, 'row')}>
        <div className={styles.title}>
          <Icon icon={<Logo />} size="large" className={styles.logo} />
          <Link href={isSharePage ? HOMEPAGE_URL : '/'}>umami</Link>
        </div>

        {user && (
          <>
            <HamburgerButton />
            <div className={styles.links}>
              <Link href="/dashboard">
                <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />
              </Link>
              <Link href="/realtime">
                <FormattedMessage id="label.realtime" defaultMessage="Realtime" />
              </Link>
              {!process.env.isCloudMode && (
                <Link href="/settings">
                  <FormattedMessage id="label.settings" defaultMessage="Settings" />
                </Link>
              )}
            </div>
          </>
        )}
        <div className={styles.buttons}>
          <ThemeButton />
          <LanguageButton menuAlign="right" />
          {user && <UserButton />}
        </div>
      </header>
    </>
  );
}
