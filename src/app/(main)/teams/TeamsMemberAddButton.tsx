import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { messages } from '@/components/messages';
import { TeamMemberAddForm } from './TeamMemberAddForm';

export function TeamsMemberAddButton({
  teamId,
  onSave,
}: {
  teamId: string;
  onSave?: () => void;
  isAdmin?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('teams:members');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addMember)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addMember)} style={{ width: 400 }}>
          {({ close }) => <TeamMemberAddForm teamId={teamId} onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
