import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import MenuButton from 'components/common/MenuButton';
import Icon from 'components/common/Icon';
import User from 'assets/user.svg';
import Chevron from 'assets/chevron-down.svg';
import styles from './UserButton.module.css';

export default function UserButton() {
  const user = useSelector(state => state.user);
  const router = useRouter();

  const menuOptions = [
    {
      label: (
        <FormattedMessage
          id="label.logged-in-as"
          defaultMessage="Logged in as {username}"
          values={{ username: <b>{user.username}</b> }}
        />
      ),
      value: 'username',
      className: styles.username,
    },
    { label: <FormattedMessage id="label.profile" defaultMessage="Profile" />, value: 'profile' },
    { label: <FormattedMessage id="label.logout" defaultMessage="Logout" />, value: 'logout' },
  ];

  function handleSelect(value) {
    if (value === 'logout') {
      router.push('/logout');
    } else if (value === 'profile') {
      router.push('/settings/profile');
    }
  }

  return (
    <MenuButton
      icon={<Icon icon={<User />} size="large" />}
      value={<Icon icon={<Chevron />} size="small" />}
      options={menuOptions}
      onSelect={handleSelect}
    />
  );
}
