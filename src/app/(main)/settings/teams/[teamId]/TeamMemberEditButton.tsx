import { useMessages, useModified } from '@/components/hooks';
import { Row, Button, Icon, Modal, DialogTrigger, Dialog, useToast } from '@umami/react-zen';
import { TeamMemberEditForm } from './TeamMemberEditForm';
import { Edit } from '@/components/icons';

export function TeamMemberEditButton({
  teamId,
  userId,
  role,
  onSave,
}: {
  teamId: string;
  userId: string;
  role: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = () => {
    touch('teams:members');
    toast(formatMessage(messages.saved));
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Row alignItems="center" gap>
          <Icon>
            <Edit />
          </Icon>
        </Row>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.editMember)}>
          {({ close }) => (
            <TeamMemberEditForm
              teamId={teamId}
              userId={userId}
              role={role}
              onSave={handleSave}
              onClose={close}
            />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
