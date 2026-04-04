import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

export function CohortDeleteButton({
  cohortId,
  websiteId,
  name,
  onSave,
}: {
  cohortId: string;
  websiteId: string;
  name: string;
  onSave?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(
    `/websites/${websiteId}/segments/${cohortId}`,
  );

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('cohorts');
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
