import { useQueryClient } from '@tanstack/react-query';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

export function SecurityKeyDeleteButton({ keyId, name }: { keyId: string; name: string }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/2fa/security-keys/${keyId}`);
  const { touch } = useModified();
  const queryClient = useQueryClient();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('security-keys');
        queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
        close();
      },
    });
  };

  return (
    <DialogButton icon={<Trash />} title={t(labels.confirm)} variant="quiet" width="400px">
      {({ close }) => (
        <ConfirmationForm
          message={t.rich(messages.confirmRemove, {
            target: name,
            b: chunks => <b>{chunks}</b>,
          })}
          isLoading={isPending}
          error={getErrorMessage(error)}
          onConfirm={handleConfirm.bind(null, close)}
          onClose={close}
          buttonLabel={t(labels.delete)}
          buttonVariant="danger"
        />
      )}
    </DialogButton>
  );
}
