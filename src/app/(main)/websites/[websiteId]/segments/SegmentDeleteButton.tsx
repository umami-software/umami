import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { messages } from '@/components/messages';

export function SegmentDeleteButton({
  segmentId,
  websiteId,
  name,
  onSave,
}: {
  segmentId: string;
  websiteId: string;
  name: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, FormattedMessage } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(
    `/websites/${websiteId}/segments/${segmentId}`,
  );

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('segments');
        onSave?.();
        close();
      },
    });
  };

  return (
    <DialogButton
      icon={<Trash />}
      title={formatMessage(labels.confirm)}
      variant="quiet"
      width="600px"
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
