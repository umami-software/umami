import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActionForm } from '@/components/common/ActionForm';
import { useMessages, useModified } from '@/components/hooks';
import { TeamDeleteForm } from './TeamDeleteForm';

export function TeamManage({ teamId }: { teamId: string }) {
  const { t, labels, messages } = useMessages();
  const router = useRouter();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <ActionForm label={t(labels.deleteTeam)} description={t(messages.deleteTeamWarning)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" />}>{t(labels.delete)}</DialogTrigger>
        <DialogContent style={{ width: 400 }}>
          <DialogHeader>
            <DialogTitle>{t(labels.deleteTeam)}</DialogTitle>
          </DialogHeader>
          <TeamDeleteForm teamId={teamId} onSave={handleLeave} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </ActionForm>
  );
}
