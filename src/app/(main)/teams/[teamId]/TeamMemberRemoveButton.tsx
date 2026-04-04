import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

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
  const { t, labels, messages } = useMessages();
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
    <DialogButton icon={<Trash />} title={t(labels.confirm)} variant="quiet" width="400px">
      {({ close }) => (
        <ConfirmationForm
          message={t.rich(messages.confirmRemove, {
            target: userName,
            b: chunks => <b>{chunks}</b>,
          })}
          isLoading={isPending}
          error={error}
          onConfirm={handleConfirm.bind(null, close)}
          onClose={close}
          buttonLabel={t(labels.remove)}
          buttonVariant="danger"
        />
      )}
    </DialogButton>
  );
}
