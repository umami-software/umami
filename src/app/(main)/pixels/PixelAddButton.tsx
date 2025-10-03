import { useMessages } from '@/components/hooks';
import { Button, Icon, Modal, Dialog, DialogTrigger, Text } from '@umami/react-zen';
import { Plus } from '@/components/icons';
import { PixelEditForm } from './PixelEditForm';

export function PixelAddButton({ teamId }: { teamId?: string }) {
  const { formatMessage, labels } = useMessages();

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
          {({ close }) => <PixelEditForm teamId={teamId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
