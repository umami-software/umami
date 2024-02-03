'use client';
import { ActionForm, Button, Modal, ModalTrigger } from 'react-basics';
import { useMessages } from 'components/hooks';
import TeamDeleteForm from '../TeamDeleteForm';

export function TeamData({ teamId }: { teamId: string }) {
  const { formatMessage, labels, messages } = useMessages();

  return (
    <ActionForm
      label={formatMessage(labels.deleteTeam)}
      description={formatMessage(messages.deleteTeamWarning)}
    >
      <ModalTrigger>
        <Button variant="danger">{formatMessage(labels.delete)}</Button>
        <Modal title={formatMessage(labels.deleteTeam)}>
          {(close: () => void) => <TeamDeleteForm teamId={teamId} onClose={close} />}
        </Modal>
      </ModalTrigger>
    </ActionForm>
  );
}

export default TeamData;
