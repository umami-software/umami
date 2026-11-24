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
import { UserAddForm } from './UserAddForm';

export function UserAddButton({ onSave }: { onSave?: () => void }) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    toast(t(messages.saved));
    touch('users');
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button data-test="button-create-user" />}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.createUser)}</Text>
      </DialogTrigger>
      <DialogContent style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.createUser)}</DialogTitle>
        </DialogHeader>
        <UserAddForm onSave={handleSave} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
