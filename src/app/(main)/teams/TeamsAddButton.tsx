import { Button, Icon, Modal, DialogTrigger, Dialog, Text, useToast } from '@umami/react-zen';
import { Plus } from '@/components/icons';
import { useMessages, useModified } from '@/components/hooks';
import { TeamAddForm } from './TeamAddForm';
import { messages } from '@/components/messages';

export function TeamsAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('teams');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.createTeam)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.createTeam)} style={{ width: 400 }}>
          {({ close }) => <TeamAddForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
