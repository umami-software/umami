import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/common/Link';
import UserButton from '../common/UserButton';
import Icon from '../common/Icon';
import Logo from 'assets/logo.svg';
import styles from './Header.module.css';
import LanguageButton from '../common/LanguageButton';

export default function Header() {
  const user = useSelector(state => state.user);

  return (
    <header className="container">
      <div className={classNames(styles.header, 'row align-items-center')}>
        <div className="col-12 col-md-3">
          <div className={styles.title}>
            <Icon icon={<Logo />} size="large" className={styles.logo} />
            <Link href={user ? '/' : 'https://umami.is'}>umami</Link>
          </div>
        </div>
        <div className="col-12 col-md-9">
          <div className={styles.nav}>
            {user ? (
              <>
                <Link href="/dashboard">
                  <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />
                </Link>
                <Link href="/settings">
                  <FormattedMessage id="label.settings" defaultMessage="Settings" />
                </Link>
                <LanguageButton menuAlign="right" />
                <UserButton />
              </>
            ) : (
              <LanguageButton menuAlign="right" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
