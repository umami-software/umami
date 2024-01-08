import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import TeamDeleteForm from './TeamDeleteForm';

export function TeamDeleteButton({
  teamId,
  teamName,
  onDelete,
}: {
  teamId: string;
  teamName: string;
  onDelete?: () => void;
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <ModalTrigger>
      <Button>
        <Icon>
          <Icons.Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal title={formatMessage(labels.deleteTeam)}>
        {(close: any) => (
          <TeamDeleteForm teamId={teamId} teamName={teamName} onSave={onDelete} onClose={close} />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamDeleteButton;
