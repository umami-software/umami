import { Key } from 'react';
import { Text, Icon, Button, Popup, Menu, Item, PopupTrigger, Flexbox } from 'react-basics';
import Icons from 'components/icons';
import { useLogin, useMessages, useNavigation } from 'components/hooks';
import Avatar from 'components/common/Avatar';
import styles from './TeamsButton.module.css';

export function TeamsButton({ teamId }: { teamId: string }) {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const { router } = useNavigation();

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
      <Button className={styles.button}>
        <Icon>{teamId ? <Icons.Users /> : <Icons.User />}</Icon>
        <Text>{teamId ? user.teams.find(({ id }) => id === teamId)?.name : user.username}</Text>
      </Button>
      <Popup alignment="end">
        {close => (
          <Menu variant="popup" onSelect={handleSelect.bind(null, close)}>
            <div className={styles.heading}>{formatMessage(labels.myAccount)}</div>
            <Item key={user.id}>{user.username}</Item>
            <div className={styles.heading}>{formatMessage(labels.team)}</div>
            {user.teams.map(({ id, name }) => (
              <Item key={id}>
                <Flexbox gap={10} alignItems="center">
                  <Icon size="md">
                    <Avatar value={id} />
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
