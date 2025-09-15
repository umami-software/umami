import { Dialog } from '@umami/react-zen';
import { ActionButton } from '@/components/input/ActionButton';
import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { messages } from '@/components/messages';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
export function PixelDeleteButton({
  pixelId,
  name,
  onSave,
}: {
  pixelId: string;
  name: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, getErrorMessage } = useMessages();
  const { mutate, isPending, error } = useDeleteQuery(`/pixels/${pixelId}`);
  const { touch } = useModified();

  const handleConfirm = (close: () => void) => {
    mutate(null, {
      onSuccess: () => {
        touch('pixels');
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
