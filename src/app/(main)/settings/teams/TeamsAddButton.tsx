import { Button, Icon, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import Icons from 'components/icons';
import { useMessages, useModified } from 'components/hooks';
import TeamAddForm from './TeamAddForm';
import { messages } from 'components/messages';

export function TeamsAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { showToast } = useToasts();
  const { touch } = useModified();

  const handleSave = async () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    touch('teams');
    onSave?.();
  };

  return (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createTeam)}</Text>
      </Button>
      <Modal title={formatMessage(labels.createTeam)}>
        {(close: () => void) => <TeamAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamsAddButton;
