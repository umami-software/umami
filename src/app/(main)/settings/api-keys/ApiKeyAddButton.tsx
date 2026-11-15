import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@umami/react-zen';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { ApiKeyAddForm } from './ApiKeyAddForm';

export function ApiKeyAddButton({ onSave }: { onSave?: () => void }) {
  const { t, labels } = useMessages();
  const { touch } = useModified();

  const handleSave = () => {
    touch('api-keys');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.createApiKey)}</Text>
      </Button>
      <Modal>
        <Dialog title={t(labels.createApiKey)} style={{ width: 480 }}>
          {({ close }) => <ApiKeyAddForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
