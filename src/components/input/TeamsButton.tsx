import { Key } from 'react';
import { Text, Icon, Button, Popup, Menu, Item, PopupTrigger, Flexbox } from 'react-basics';
import Icons from 'components/icons';
import { useLogin, useMessages, useNavigation } from 'components/hooks';
import styles from './TeamsButton.module.css';
import classNames from 'classnames';

export function TeamsButton({ teamId }: { teamId: string }) {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const { router } = useNavigation();
  const team = user?.teams?.find(({ id }) => id === teamId);

  const handleSelect = (close: () => void, id: Key) => {
    if (id !== user.id) {
      router.push(`/teams/${id}`);
    } else {
      router.push('/');
    }
    close();
  };

  return (
    <PopupTrigger>
      <Button className={styles.button} variant="quiet">
        <Icon>{teamId ? <Icons.Users /> : <Icons.User />}</Icon>
        <Text>{teamId ? team?.name : user.username}</Text>
      </Button>
      <Popup alignment="end">
        {(close: () => void) => (
          <Menu variant="popup" onSelect={handleSelect.bind(null, close)}>
            <div className={styles.heading}>{formatMessage(labels.myAccount)}</div>
            <Item key={user.id} className={classNames({ [styles.selected]: !teamId })}>
              <Flexbox gap={10} alignItems="center">
                <Icon>
                  <Icons.User />
                </Icon>
                <Text>{user.username}</Text>
              </Flexbox>
            </Item>
            <div className={styles.heading}>{formatMessage(labels.team)}</div>
            {user?.teams?.map(({ id, name }) => (
              <Item key={id} className={classNames({ [styles.selected]: id === teamId })}>
                <Flexbox gap={10} alignItems="center">
                  <Icon>
                    <Icons.Users />
                  </Icon>
                  <Text>{name}</Text>
                </Flexbox>
              </Item>
            ))}
          </Menu>
        )}
      </Popup>
    </PopupTrigger>
  );
}

export default TeamsButton;
