import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

export function PixelDeleteButton({
  pixelId,
  name,
  onSave,
}: {
  pixelId: string;
  name: string;
  onSave?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/pixels/${pixelId}`);
  const { touch } = useModified();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('pixels');
        onSave?.();
        close();
      },
    });
  };

  return (
    <DialogButton icon={<Trash />} variant="quiet" title={t(labels.confirm)} width="400px">
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
