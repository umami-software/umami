'use client';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

const invalidationKeys = [
  ['sessions:stats'],
  ['websites:stats'],
  ['websites:events'],
  ['websites:events:stats'],
  ['websites:revenue:chart'],
  ['websites:revenue:metrics'],
  ['realtime'],
];

export function SessionDeleteButton({
  websiteId,
  sessionId,
  onSave,
}: {
  websiteId: string;
  sessionId: string;
  onSave?: () => void;
}) {
  const queryClient = useQueryClient();
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(
    `/websites/${websiteId}/sessions/${sessionId}`,
  );

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('sessions');
        touch('replays');
        touch('revenue-sessions');

        await Promise.all(
          invalidationKeys.map(queryKey => queryClient.invalidateQueries({ queryKey })),
        );

        onSave?.();
        close();
      },
    });
  };

  return (
    <DialogButton
      aria-label={t(labels.delete)}
      data-test="button-delete-session"
      icon={<Trash />}
      title={t(labels.confirm)}
      variant="quiet"
      width="400px"
    >
      {({ close }) => (
        <ConfirmationForm
          message={t(messages.confirmDelete, { target: t(labels.session) })}
          isLoading={isPending}
          error={getErrorMessage(error)}
          onConfirm={handleConfirm.bind(null, close)}
          onClose={close}
          buttonLabel={t(labels.delete)}
          buttonVariant="danger"
        />
      )}
    </DialogButton>
  );
}
