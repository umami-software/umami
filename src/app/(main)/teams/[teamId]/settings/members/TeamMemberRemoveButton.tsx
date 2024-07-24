import ConfirmationForm from 'components/common/ConfirmationForm';
import { useApi, useMessages, useModified } from 'components/hooks';
import { messages } from 'components/messages';
import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import { FormattedMessage } from 'react-intl';

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
    <ModalTrigger>
      <Button>
        <Icon>
          <Icons.Close />
        </Icon>
        <Text>{formatMessage(labels.remove)}</Text>
      </Button>
      <Modal title={formatMessage(labels.removeMember)}>
        {(close: () => void) => (
          <ConfirmationForm
            message={
              <FormattedMessage
                {...messages.confirmRemove}
                values={{ target: <b>{userName}</b> }}
              />
            }
            isLoading={isPending}
            error={error}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.remove)}
          />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamMemberRemoveButton;
