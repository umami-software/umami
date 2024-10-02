import { Key } from 'react';
import { Icon, Button, PopupTrigger, Popup, Menu, Item, Text } from 'react-basics';
import { useRouter } from 'next/navigation';
import Icons from 'components/icons';
import { useMessages, useLogin, useLocale } from 'components/hooks';
import { CURRENT_VERSION } from 'lib/constants';
import styles from './ProfileButton.module.css';

export function ProfileButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const router = useRouter();
  const { dir } = useLocale();
  const cloudMode = !!process.env.cloudMode;

  const handleSelect = (key: Key, close: () => void) => {
    if (key === 'profile') {
      router.push('/profile');
    }
    if (key === 'logout') {
      router.push('/logout');
    }
    close();
  };

  return (
    <PopupTrigger>
      <Button data-test="button-profile" variant="quiet">
        <Icon>
          <Icons.Profile />
        </Icon>
      </Button>
      <Popup position="bottom" alignment={dir === 'rtl' ? 'start' : 'end'}>
        {(close: () => void) => (
          <Menu onSelect={key => handleSelect(key, close)} className={styles.menu}>
            <Text className={styles.name}>{user.username}</Text>
            <Item key="profile" className={styles.item} divider={true}>
              <Icon>
                <Icons.User />
              </Icon>
              <Text>{formatMessage(labels.profile)}</Text>
            </Item>
            {!cloudMode && (
              <Item data-test="item-logout" key="logout" className={styles.item}>
                <Icon>
                  <Icons.Logout />
                </Icon>
                <Text>{formatMessage(labels.logout)}</Text>
              </Item>
            )}
            <div className={styles.version}>{`v${CURRENT_VERSION}`}</div>
          </Menu>
        )}
      </Popup>
    </PopupTrigger>
  );
}

export default ProfileButton;
