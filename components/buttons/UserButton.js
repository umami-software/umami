import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';
import { AUTH_TOKEN } from 'lib/constants';
import { removeItem } from 'next-basics';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { Button, Icon, Item, Menu, Popup, Text } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import useDocumentClick from 'hooks/useDocumentClick';
import Profile from 'assets/profile.svg';
import styles from './UserButton.module.css';

export default function UserButton() {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const user = useUser();
  const router = useRouter();
  const { adminDisabled } = useConfig();

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
      hidden: adminDisabled,
      divider: true,
    },
    { label: <FormattedMessage id="label.logout" defaultMessage="Logout" />, value: 'logout' },
  ];

  function handleClick() {
    setShow(state => !state);
  }

  function handleSelect(value) {
    if (value === 'logout') {
      removeItem(AUTH_TOKEN);
      router.push('/login');
    } else if (value === 'profile') {
      router.push('/profile');
    }
  }

  useDocumentClick(e => {
    if (!ref.current?.contains(e.target)) {
      setShow(false);
    }
  });

  return (
    <div className={styles.button} ref={ref}>
      <Button variant="light" onClick={handleClick}>
        <Icon className={styles.icon} size="large">
          <Profile />
        </Icon>
      </Button>
      {show && (
        <Popup className={styles.menu} position="bottom" gap={5}>
          <Menu items={menuOptions} onSelect={handleSelect}>
            {({ label, value }) => (
              <Item key={value}>
                <Text>{label}</Text>
              </Item>
            )}
          </Menu>
        </Popup>
      )}
    </div>
  );
}
