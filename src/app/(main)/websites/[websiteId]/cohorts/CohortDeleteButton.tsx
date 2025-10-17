import { Trash } from '@/components/icons';
import { messages } from '@/components/messages';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
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
  const { formatMessage, labels, FormattedMessage } = useMessages();
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
    <DialogButton
      icon={<Trash />}
      variant="quiet"
      title={formatMessage(labels.confirm)}
      width="400px"
    >
      {({ close }) => (
        <ConfirmationForm
          message={
            <FormattedMessage
              {...messages.confirmRemove}
              values={{
                target: <b>{name}</b>,
              }}
            />
          }
          isLoading={isPending}
          error={error}
          onConfirm={handleConfirm.bind(null, close)}
          onClose={close}
          buttonLabel={formatMessage(labels.delete)}
          buttonVariant="danger"
        />
      )}
    </DialogButton>
  );
}
