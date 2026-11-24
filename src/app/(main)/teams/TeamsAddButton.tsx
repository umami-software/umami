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
import { TeamAddForm } from './TeamAddForm';

export function TeamsAddButton({
  onSave,
  isAdmin = false,
}: {
  onSave?: () => void;
  isAdmin?: boolean;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('teams');
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.createTeam)}</Text>
      </DialogTrigger>
      <DialogContent style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.createTeam)}</DialogTitle>
        </DialogHeader>
        <TeamAddForm onSave={handleSave} onClose={() => setOpen(false)} isAdmin={isAdmin} />
      </DialogContent>
    </Dialog>
  );
}
