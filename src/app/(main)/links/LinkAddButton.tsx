import { useMessages } from '@/components/hooks';
import { Button, Icon, Modal, Dialog, DialogTrigger, Text } from '@umami/react-zen';
import { Plus } from '@/components/icons';
import { LinkEditForm } from './LinkEditForm';

export function LinkAddButton({ teamId }: { teamId?: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button data-test="button-website-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addLink)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addLink)} style={{ width: 600 }}>
          {({ close }) => <LinkEditForm teamId={teamId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
