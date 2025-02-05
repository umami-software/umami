import { useMessages, useModified } from '@/components/hooks';
import { Button, Icon, Icons, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import TeamMemberEditForm from './TeamMemberEditForm';

export function TeamMemberEditButton({
  teamId,
  userId,
  role,
  onSave,
}: {
  teamId: string;
  userId: string;
  role: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();
  const { touch } = useModified();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    touch('teams:members');
    onSave?.();
  };

  return (
    <ModalTrigger>
      <Button>
        <Icon>
          <Icons.Edit />
        </Icon>
        <Text>{formatMessage(labels.edit)}</Text>
      </Button>
      <Modal title={formatMessage(labels.editMember)}>
        {(close: () => void) => (
          <TeamMemberEditForm
            teamId={teamId}
            userId={userId}
            role={role}
            onSave={handleSave}
            onClose={close}
          />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamMemberEditButton;
