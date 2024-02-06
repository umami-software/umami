import { useApi, useMessages } from 'components/hooks';
import ConfirmationForm from 'components/common/ConfirmationForm';
import { touch } from 'store/modified';

export function UserDeleteForm({ userId, username, onSave, onClose }) {
  const { FormattedMessage, messages, labels, formatMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({ mutationFn: () => del(`/users/${userId}`) });

  const handleConfirm = async () => {
    mutate(null, {
      onSuccess: async () => {
        touch('users');
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <ConfirmationForm
      message={
        <FormattedMessage {...messages.confirmDelete} values={{ target: <b>{username}</b> }} />
      }
      onConfirm={handleConfirm}
      onClose={onClose}
      buttonLabel={formatMessage(labels.delete)}
      isLoading={isPending}
      error={error}
    />
  );
}

export default UserDeleteForm;
