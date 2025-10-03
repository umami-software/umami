import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { messages } from '@/components/messages';
import { Trash } from '@/components/icons';
import { Dialog } from '@umami/react-zen';
import { ActionButton } from '@/components/input/ActionButton';

export function TeamMemberRemoveButton({
  teamId,
  userId,
  userName,
  onSave,
}: {
  teamId: string;
  userId: string;
  userName: string;
  disabled?: boolean;
  onSave?: () => void;
}) {
  const { formatMessage, labels, FormattedMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/teams/${teamId}/users/${userId}`);
  const { touch } = useModified();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('teams:members');
        onSave?.();
        close();
      },
    });
  };

  return (
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.removeMember)} style={{ width: 400 }}>
        {({ close }) => (
          <ConfirmationForm
            message={
              <FormattedMessage
                {...messages.confirmRemove}
                values={{
                  target: <b>{userName}</b>,
                }}
              />
            }
            isLoading={isPending}
            error={error}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.remove)}
            buttonVariant="danger"
          />
        )}
      </Dialog>
    </ActionButton>
  );
}
