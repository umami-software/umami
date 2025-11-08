import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { messages } from '@/components/messages';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';

export function LinkDeleteButton({
  linkId,
  name,
  onSave,
}: {
  linkId: string;
  websiteId: string;
  name: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(`/links/${linkId}`);

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('links');
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
