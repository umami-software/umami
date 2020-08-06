import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/Link';
import UserButton from './UserButton';
import styles from './Header.module.css';

export default function Header() {
  const user = useSelector(state => state.user);

  return (
    <header className={classNames(styles.header, 'container')}>
      <div className="row align-items-center">
        <div className="col">
          <div className={styles.title}>{user ? <Link href="/">umami</Link> : 'umami'}</div>
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
