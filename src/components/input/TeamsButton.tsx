import { Key } from 'react';
import { Text, Icon, Button, Popup, Menu, Item, PopupTrigger, Flexbox } from 'react-basics';
import classNames from 'classnames';
import Icons from 'components/icons';
import { useLogin, useMessages, useTeams, useTeamUrl } from 'components/hooks';
import styles from './TeamsButton.module.css';

export function TeamsButton({
  className,
  showText = true,
  onChange,
}: {
  className?: string;
  showText?: boolean;
  onChange?: (value: string) => void;
}) {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const { result } = useTeams(user?.id);
  const { teamId } = useTeamUrl();
  const team = result?.data?.find(({ id }) => id === teamId);

  const handleSelect = (close: () => void, id: Key) => {
    onChange?.((id !== user.id ? id : '') as string);
    close();
  };

  if (!result?.count) {
    return null;
  }

  return (
    <PopupTrigger>
      <Button className={classNames(styles.button, className)} variant="quiet">
        <Icon>{teamId ? <Icons.Users /> : <Icons.User />}</Icon>
        {showText && <Text>{teamId ? team?.name : user.username}</Text>}
        <Icon>
          <Icons.ChevronDown />
        </Icon>
      </Button>
      <Popup alignment="end">
        {(close: () => void) => (
          <Menu className={styles.menu} variant="popup" onSelect={handleSelect.bind(null, close)}>
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
            {result?.data?.map(({ id, name }) => (
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
