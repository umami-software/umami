import { Dialog } from '@umami/react-zen';
import { ActionButton } from '@/components/input/ActionButton';
import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { messages } from '@/components/messages';
import { useApi, useMessages, useModified } from '@/components/hooks';

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
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => del(`/websites/${websiteId}/segments/${segmentId}`),
  });
  const { touch } = useModified();

  const handleConfirm = (close: () => void) => {
    mutate(null, {
      onSuccess: () => {
        touch('segments');
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
            error={error}
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
