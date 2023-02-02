import { useIntl } from 'react-intl';
import { Button, Icon, Text, Modal, Icons, ModalTrigger } from 'react-basics';
import UserAddForm from './UserAddForm';
import { labels } from 'components/messages';

export default function UserAddButton({ onSave }) {
  const { formatMessage } = useIntl();

  const handleSave = () => {
    onSave();
  };

  return (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createUser)}</Text>
      </Button>
      <Modal title={formatMessage(labels.createUser)}>
        {close => <UserAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}
