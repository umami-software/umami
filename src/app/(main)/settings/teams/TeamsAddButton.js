import { Button, Icon, Modal, ModalTrigger, Text } from 'react-basics';
import Icons from 'components/icons';
import useMessages from 'components/hooks/useMessages';
import TeamAddForm from './TeamAddForm';

export function TeamsAddButton({ onAdd }) {
  const { formatMessage, labels } = useMessages();

  return (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createTeam)}</Text>
      </Button>
      <Modal title={formatMessage(labels.createTeam)}>
        {close => <TeamAddForm onSave={onAdd} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamsAddButton;
