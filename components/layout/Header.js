import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/common/Link';
import UserButton from 'components/common/UserButton';
import Icon from 'components/common/Icon';
import LanguageButton from 'components/settings/LanguageButton';
import ThemeButton from 'components/settings/ThemeButton';
import Logo from 'assets/logo.svg';
import styles from './Header.module.css';

export default function Header() {
  const user = useSelector(state => state.user);

  return (
    <header className="container">
      <div className={classNames(styles.header, 'row align-items-center')}>
        <div className="col-12 col-md-12 col-lg-3">
          <div className={styles.title}>
            <Icon icon={<Logo />} size="large" className={styles.logo} />
            <Link href={user ? '/' : 'https://umami.is'}>umami</Link>
          </div>
        </div>
        <div className="col-12 col-md-12 col-lg-6">
          {user && (
            <div className={styles.nav}>
              <Link href="/dashboard">
                <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />
              </Link>
              <Link href="/settings">
                <FormattedMessage id="label.settings" defaultMessage="Settings" />
              </Link>
            </div>
          )}
        </div>
        <div className="col-12 col-md-12 col-lg-3">
          <div className={styles.buttons}>
            <LanguageButton menuAlign="right" />
            <ThemeButton />
            {user && <UserButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
