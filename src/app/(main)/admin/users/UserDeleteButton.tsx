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
import { useState } from 'react';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { UserDeleteForm } from './UserDeleteForm';

export function UserDeleteButton({
  userId,
  username,
  onDelete,
}: {
  userId: string;
  username: string;
  onDelete?: () => void;
}) {
  const { t, labels } = useMessages();
  const { user } = useLoginQuery();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary" disabled={userId === user?.id} data-test="button-delete" />
        }
      >
        <Icon size="sm">
          <Trash />
        </Icon>
        <Text>{t(labels.delete)}</Text>
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={{ width: 400 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.deleteUser)}</DialogTitle>
        </DialogHeader>
        <UserDeleteForm
          userId={userId}
          username={username}
          onSave={onDelete}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
