import { Button, Icon, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import Icons from '@/components/icons';
import { useMessages, useModified } from '@/components/hooks';
import TeamJoinForm from './TeamJoinForm';

export function TeamsJoinButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();
  const { touch } = useModified();

  const handleJoin = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    touch('teams');
  };

  return (
    <ModalTrigger>
      <Button variant="secondary">
        <Icon>
          <Icons.AddUser />
        </Icon>
        <Text>{formatMessage(labels.joinTeam)}</Text>
      </Button>
      <Modal title={formatMessage(labels.joinTeam)}>
        {close => <TeamJoinForm onSave={handleJoin} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamsJoinButton;
