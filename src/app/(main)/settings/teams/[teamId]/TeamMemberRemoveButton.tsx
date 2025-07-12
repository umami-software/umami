import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { messages } from '@/components/messages';
import { Trash } from '@/components/icons';
import { Button, Icon, Modal, DialogTrigger, Dialog } from '@umami/react-zen';

export function TeamMemberRemoveButton({
  teamId,
  userId,
  userName,
  onSave,
}: {
  teamId: string;
  userId: string;
  userName: string;
  disabled?: boolean;
  onSave?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => del(`/teams/${teamId}/users/${userId}`),
  });
  const { touch } = useModified();

  const handleConfirm = (close: () => void) => {
    mutate(null, {
      onSuccess: () => {
        touch('teams:members');
        onSave?.();
        close();
      },
    });
  };

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Icon>
          <Trash />
        </Icon>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.removeMember)} style={{ width: 400 }}>
          {({ close }) => (
            <ConfirmationForm
              message={formatMessage(messages.confirmRemove, {
                target: userName,
              })}
              isLoading={isPending}
              error={error}
              onConfirm={handleConfirm.bind(null, close)}
              onClose={close}
              buttonLabel={formatMessage(labels.remove)}
              buttonVariant="danger"
            />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
