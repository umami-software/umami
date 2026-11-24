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
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { ApiKeyAddForm } from './ApiKeyAddForm';

export function ApiKeyAddButton({ onSave }: { onSave?: () => void }) {
  const { t, labels } = useMessages();
  const { touch } = useModified();
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    touch('api-keys');
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.createApiKey)}</Text>
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={{ width: 480, maxWidth: 'calc(100% - 2rem)' }}>
        <DialogHeader>
          <DialogTitle>{t(labels.createApiKey)}</DialogTitle>
        </DialogHeader>
        <ApiKeyAddForm onSave={handleSave} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
