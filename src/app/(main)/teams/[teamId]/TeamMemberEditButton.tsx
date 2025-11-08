import { useMessages, useModified } from '@/components/hooks';
import { useToast } from '@umami/react-zen';
import { TeamMemberEditForm } from './TeamMemberEditForm';
import { DialogButton } from '@/components/input/DialogButton';
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
    <DialogButton
      icon={<Edit />}
      title={formatMessage(labels.editMember)}
      variant="quiet"
      width="400px"
    >
      {({ close }) => (
        <TeamMemberEditForm
          teamId={teamId}
          userId={userId}
          role={role}
          onSave={handleSave}
          onClose={close}
        />
      )}
    </DialogButton>
  );
}
