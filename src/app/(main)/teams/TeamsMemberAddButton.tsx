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
import { Plus } from '@/components/icons';
import { TeamMemberAddForm } from './TeamMemberAddForm';

export function TeamsMemberAddButton({
  teamId,
  onSave,
}: {
  teamId: string;
  onSave?: () => void;
  isAdmin?: boolean;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('teams:members');
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.addMember)}</Text>
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.addMember)}</DialogTitle>
        </DialogHeader>
        <TeamMemberAddForm teamId={teamId} onSave={handleSave} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
