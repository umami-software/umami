import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

export function AnnotationDeleteButton({
  annotationId,
  websiteId,
  onSave,
}: {
  annotationId: string;
  websiteId: string;
  onSave?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(
    `/websites/${websiteId}/annotations/${annotationId}`,
  );

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('annotations');
        onSave?.();
        close();
      },
    });
  };

  return (
    <DialogButton icon={<Trash />} variant="quiet" title={t(labels.confirm)} width="400px">
      {({ close }) => (
        <ConfirmationForm
          message={t(messages.confirmDelete, { target: t(labels.note) })}
          isLoading={isPending}
          error={error}
          onConfirm={handleConfirm.bind(null, close)}
          onClose={close}
          buttonLabel={t(labels.delete)}
          buttonVariant="danger"
        />
      )}
    </DialogButton>
  );
}
