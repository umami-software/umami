import { useMessages, useModified } from 'components/hooks';
import { useRouter } from 'next/navigation';
import { ActionForm, Button, Modal, ModalTrigger } from 'react-basics';
import TeamDeleteForm from './TeamDeleteForm';

export function TeamManage({ teamId }: { teamId: string }) {
  const { formatMessage, labels, messages } = useMessages();
  const router = useRouter();
  const { touch } = useModified();

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <ActionForm
      label={formatMessage(labels.deleteTeam)}
      description={formatMessage(messages.deleteTeamWarning)}
    >
      <ModalTrigger>
        <Button variant="danger">{formatMessage(labels.delete)}</Button>
        <Modal title={formatMessage(labels.deleteTeam)}>
          {(close: () => void) => (
            <TeamDeleteForm teamId={teamId} onSave={handleLeave} onClose={close} />
          )}
        </Modal>
      </ModalTrigger>
    </ActionForm>
  );
}

export default TeamManage;
