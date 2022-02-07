import React, { useState } from 'react';
import Image from 'next/image';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Link from 'components/common/Link';
import LanguageButton from 'components/settings/LanguageButton';
import ThemeButton from 'components/settings/ThemeButton';
import UpdateNotice from 'components/common/UpdateNotice';
import UserButton from 'components/settings/UserButton';
import Button from 'components/common/Button';
import Logo from 'public/alpine-social.png';
import styles from './Header.module.css';
import useLocale from 'hooks/useLocale';
import XMark from 'assets/xmark.svg';
import Bars from 'assets/bars.svg';

export default function Header() {
  const user = useSelector(state => state.user);
  const [active, setActive] = useState(false);
  const { dir } = useLocale();

  function handleClick() {
    setActive(state => !state);
  }

  return (
    <nav className="container" dir={dir}>
      {user?.is_admin && <UpdateNotice />}
      <div className={classNames(styles.header, 'row align-items-center')}>
        <div className={styles.nav}>
          <div className="">
            <div className={styles.title}>
              {/*<Icon icon={<Logo />} size="large" className={styles.logo} />*/}
              <Image src={Logo} width="40px" height="40px" alt="alpineUX logo" />
              <span style={{ marginLeft: '10px', fontFamily: 'Helvetica Neue' }}>
                <Link href={user ? '/' : 'https://alpineux.com'}>analytics</Link>
              </span>
            </div>
          </div>
          <Button
            className={styles.burger}
            icon={active ? <XMark /> : <Bars />}
            onClick={handleClick}
          />
          {user && (
            <div className={styles.items}>
              <div className={active ? classNames(styles.active) : ''}>
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
            </div>
          )}
          <div className={styles.items}>
            <div className={active ? classNames(styles.active) : ''}>
              <div className={styles.buttons}>
                <ThemeButton />
                <LanguageButton menuAlign="right" />
                {user && <UserButton />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
