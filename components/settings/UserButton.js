import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import { removeItem } from 'next-basics';
import MenuButton from 'components/common/MenuButton';
import Icon from 'components/common/Icon';
import User from 'assets/user.svg';
import styles from './UserButton.module.css';
import { AUTH_TOKEN } from 'lib/constants';
import useUser from 'hooks/useUser';

export default function UserButton() {
  const { user } = useUser();
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
    {
      label: <FormattedMessage id="label.profile" defaultMessage="Profile" />,
      value: 'profile',
      hidden: process.env.isCloudMode,
    },
    { label: <FormattedMessage id="label.logout" defaultMessage="Logout" />, value: 'logout' },
  ];

  function handleSelect(value) {
    if (value === 'logout') {
      removeItem(AUTH_TOKEN);
      router.push('/login');
    } else if (value === 'profile') {
      router.push('/settings/profile');
    }
  }

  return (
    <MenuButton
      icon={<Icon icon={<User />} size="large" />}
      buttonVariant="light"
      options={menuOptions}
      onSelect={handleSelect}
      hideLabel
    />
  );
}
