import { Dialog } from '@umami/react-zen';
import { ActionButton } from '@/components/input/ActionButton';
import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { messages } from '@/components/messages';
import { useDeleteQuery, useMessages } from '@/components/hooks';

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
  const { formatMessage, labels, getErrorMessage } = useMessages();
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
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.confirm)} style={{ width: 400 }}>
        {({ close }) => (
          <ConfirmationForm
            message={formatMessage(messages.confirmRemove, {
              target: name,
            })}
            isLoading={isPending}
            error={getErrorMessage(error)}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.delete)}
            buttonVariant="danger"
          />
        )}
      </Dialog>
    </ActionButton>
  );
}
