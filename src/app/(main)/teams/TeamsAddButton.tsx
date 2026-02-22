import { Button, Dialog, DialogTrigger, Icon, Modal, Text, useToast } from '@umami/react-zen';
import { useMessages, useModified } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { TeamAddForm } from './TeamAddForm';

export function TeamsAddButton({
  onSave,
  isAdmin = false,
}: {
  onSave?: () => void;
  isAdmin?: boolean;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('teams');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.createTeam)}</Text>
      </Button>
      <Modal>
        <Dialog title={t(labels.createTeam)} style={{ width: 400 }}>
          {({ close }) => <TeamAddForm onSave={handleSave} onClose={close} isAdmin={isAdmin} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
