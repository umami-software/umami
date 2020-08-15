import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/common/Link';
import UserButton from '../common/UserButton';
import Icon from '../common/Icon';
import Logo from 'assets/logo.svg';
import styles from './Header.module.css';

export default function Header() {
  const user = useSelector(state => state.user);

  return (
    <header className="container">
      <div className={classNames(styles.header, 'row align-items-center')}>
        <div className="col">
          <div className={styles.title}>
            <Icon icon={<Logo />} size="large" className={styles.logo} />
            {user ? <Link href="/">umami</Link> : 'umami'}
          </div>
        </div>
        {user && (
          <div className="col">
            <div className={styles.nav}>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/settings">Settings</Link>
              <UserButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
