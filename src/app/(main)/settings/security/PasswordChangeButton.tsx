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
import { useMessages } from '@/components/hooks';
import { LockKeyhole } from '@/components/icons';
import { PasswordEditForm } from './PasswordEditForm';

export function PasswordChangeButton() {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    toast(t(messages.saved));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" />}>
        <Icon>
          <LockKeyhole />
        </Icon>
        <Text>{t(labels.changePassword)}</Text>
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.changePassword)}</DialogTitle>
        </DialogHeader>
        <PasswordEditForm onSave={handleSave} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
