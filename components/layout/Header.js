import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/common/Link';
import Icon from 'components/common/Icon';
import LanguageButton from 'components/settings/LanguageButton';
import ThemeButton from 'components/settings/ThemeButton';
import UpdateNotice from 'components/common/UpdateNotice';
import UserButton from 'components/settings/UserButton';
import Logo from 'assets/logo.svg';
import styles from './Header.module.css';

export default function Header() {
  const user = useSelector(state => state.user);

  return (
    <header className="container">
      {user?.is_admin && <UpdateNotice />}
      <div className={classNames(styles.header, 'row align-items-center')}>
        <div className="col-6 col-lg-3 order-1 order-lg-1">
          <div className={styles.title}>
            <Icon icon={<Logo />} size="large" className={styles.logo} />
            <Link href={user ? '/' : 'https://umami.is'}>umami</Link>
          </div>
        </div>
        <div className="col-12 col-lg-6 order-3 order-lg-2">
          {user && (
            <div className={styles.nav}>
              <Link href="/dashboard">
                <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />
              </Link>
              <Link href="/realtime">
                <FormattedMessage id="label.realtime" defaultMessage="Realtime" />
              </Link>
              <Link href="/settings">
                <FormattedMessage id="label.settings" defaultMessage="Settings" />
              </Link>
            </div>
          )}
        </div>
        <div className="col-6 col-lg-3 order-2 order-lg-3">
          <div className={styles.buttons}>
            <ThemeButton />
            <LanguageButton menuAlign="right" />
            {user && <UserButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
