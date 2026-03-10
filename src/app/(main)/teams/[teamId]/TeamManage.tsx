import { Button, Dialog, DialogTrigger, Modal } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { ActionForm } from '@/components/common/ActionForm';
import { useMessages, useModified } from '@/components/hooks';
import { TeamDeleteForm } from './TeamDeleteForm';

export function TeamManage({ teamId }: { teamId: string }) {
  const { t, labels, messages } = useMessages();
  const router = useRouter();
  const { touch } = useModified();

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <ActionForm label={t(labels.deleteTeam)} description={t(messages.deleteTeamWarning)}>
      <DialogTrigger>
        <Button variant="danger">{t(labels.delete)}</Button>
        <Modal>
          <Dialog title={t(labels.deleteTeam)} style={{ width: 400 }}>
            {({ close }) => <TeamDeleteForm teamId={teamId} onSave={handleLeave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </ActionForm>
  );
}
