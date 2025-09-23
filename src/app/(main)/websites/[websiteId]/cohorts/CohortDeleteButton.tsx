import { Dialog } from '@umami/react-zen';
import { ActionButton } from '@/components/input/ActionButton';
import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { messages } from '@/components/messages';
import { useDeleteQuery, useMessages } from '@/components/hooks';

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
  const { formatMessage, labels } = useMessages();
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
