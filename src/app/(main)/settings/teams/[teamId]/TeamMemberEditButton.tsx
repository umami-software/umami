import { useMessages, useModified } from '@/components/hooks';
import { Dialog, useToast } from '@umami/react-zen';
import { TeamMemberEditForm } from './TeamMemberEditForm';
import { ActionButton } from '@/components/input/ActionButton';
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
    <ActionButton tooltip={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.editMember)} style={{ width: 400 }}>
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
    </ActionButton>
  );
}
