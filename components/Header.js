import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/Link';
import styles from './Header.module.css';

export default function Header() {
  const user = useSelector(state => state.user);

  return (
    <header className={classNames(styles.header, 'container')}>
      <div className="row align-items-center">
        <div className="col">
          <Link href="/" className={styles.title}>
            umami
          </Link>
        </div>
        {user && (
          <div className="col">
            <div className={styles.nav}>
              <Link href="/">Dashboard</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/logout">Logout</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
