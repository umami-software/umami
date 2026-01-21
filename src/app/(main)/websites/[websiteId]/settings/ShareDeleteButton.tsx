import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { messages } from '@/components/messages';

export function ShareDeleteButton({
  shareId,
  slug,
  onSave,
}: {
  shareId: string;
  slug: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/share/id/${shareId}`);
  const { touch } = useModified();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('shares');
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
                target: <b>{slug}</b>,
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
