import { useMessages, useModified } from '@/components/hooks';
import { Button, Icon, Modal, Dialog, DialogTrigger, Text, useToast } from '@umami/react-zen';
import { Plus } from '@/components/icons';
import { PixelEditForm } from './PixelEditForm';

export function PixelAddButton({ teamId }: { teamId?: string }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('pixels');
  };

  return (
    <DialogTrigger>
      <Button data-test="button-website-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addPixel)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addPixel)} style={{ width: 600 }}>
          {({ close }) => <PixelEditForm teamId={teamId} onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
