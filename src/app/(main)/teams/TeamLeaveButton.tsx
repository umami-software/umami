import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icon,
  Text,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLoginQuery, useMessages, useModified } from '@/components/hooks';
import { LogOut } from '@/components/icons';
import { TeamLeaveForm } from './TeamLeaveForm';

export function TeamLeaveButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const { t, labels } = useMessages();
  const router = useRouter();
  const { user } = useLoginQuery();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" />}>
        <Icon>
          <LogOut />
        </Icon>
        <Text>{t(labels.leave)}</Text>
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.leaveTeam)}</DialogTitle>
        </DialogHeader>
        <TeamLeaveForm
          teamId={teamId}
          userId={user.id}
          teamName={teamName}
          onSave={handleLeave}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
