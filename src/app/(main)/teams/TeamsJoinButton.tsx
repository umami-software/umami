import { Button, Icon, Modal, DialogTrigger, Dialog, Text, useToast } from '@umami/react-zen';
import { UserPlus } from '@/components/icons';
import { useMessages, useModified } from '@/components/hooks';
import { TeamJoinForm } from './TeamJoinForm';

export function TeamsJoinButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleJoin = () => {
    toast(formatMessage(messages.saved));
    touch('teams');
  };

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <UserPlus />
        </Icon>
        <Text>{formatMessage(labels.joinTeam)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.joinTeam)} style={{ width: 400 }}>
          {({ close }) => <TeamJoinForm onSave={handleJoin} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
