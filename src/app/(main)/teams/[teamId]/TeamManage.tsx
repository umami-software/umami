import { useMessages, useModified } from '@/components/hooks';
import { useRouter } from 'next/navigation';
import { Button, Modal, DialogTrigger, Dialog } from '@umami/react-zen';
import { ActionForm } from '@/components/common/ActionForm';
import { TeamDeleteForm } from './TeamDeleteForm';

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
      <DialogTrigger>
        <Button variant="danger">{formatMessage(labels.delete)}</Button>
        <Modal>
          <Dialog title={formatMessage(labels.deleteTeam)} style={{ width: 400 }}>
            {({ close }) => <TeamDeleteForm teamId={teamId} onSave={handleLeave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </ActionForm>
  );
}
