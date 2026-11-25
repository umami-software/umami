import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icon,
  Text,
  useToast,
} from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useModified } from '@/components/hooks';
import { UserPlus } from '@/components/icons';
import { TeamJoinForm } from './TeamJoinForm';

export function TeamsJoinButton() {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleJoin = () => {
    toast(t(messages.saved));
    touch('teams');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Icon>
          <UserPlus />
        </Icon>
        <Text>{t(labels.joinTeam)}</Text>
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.joinTeam)}</DialogTitle>
        </DialogHeader>
        <TeamJoinForm onSave={handleJoin} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
