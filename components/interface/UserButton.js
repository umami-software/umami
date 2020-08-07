import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Menu from './Menu';
import Icon from './Icon';
import useDocumentClick from 'hooks/useDocumentClick';
import User from 'assets/user.svg';
import Chevron from 'assets/chevron-down.svg';
import styles from './UserButton.module.css';

export default function UserButton() {
  const [showMenu, setShowMenu] = useState(false);
  const user = useSelector(state => state.user);
  const ref = useRef();
  const router = useRouter();

  const menuOptions = [
    {
      label: (
        <>
          Logged in as <b>{user.username}</b>
        </>
      ),
      value: 'username',
      className: styles.username,
    },
    { label: 'Account', value: 'account' },
    { label: 'Logout', value: 'logout' },
  ];

  function handleSelect(value) {
    setShowMenu(false);

    if (value === 'account') {
      router.push('/account');
    } else if (value === 'logout') {
      router.push('/logout');
    }
  }

  useDocumentClick(e => {
    if (!ref.current.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <div ref={ref} className={styles.container}>
      <div onClick={() => setShowMenu(state => !state)}>
        <Icon icon={<User />} size="L" className={styles.icon} />
        <Icon icon={<Chevron />} size="S" />
      </div>
      {showMenu && <Menu options={menuOptions} onSelect={handleSelect} align="right" />}
    </div>
  );
}
