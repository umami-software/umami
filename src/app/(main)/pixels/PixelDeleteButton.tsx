import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { messages } from '@/components/messages';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
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
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages();
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
          error={getErrorMessage(error)}
          onConfirm={handleConfirm.bind(null, close)}
          onClose={close}
          buttonLabel={formatMessage(labels.delete)}
          buttonVariant="danger"
        />
      )}
    </DialogButton>
  );
}
