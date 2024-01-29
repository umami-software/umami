import { useApi, useMessages } from 'components/hooks';
import { useContext } from 'react';
import SettingsContext from '../../SettingsContext';
import TypeConfirmationForm from 'components/common/TypeConfirmationForm';

const CONFIRM_VALUE = 'DELETE';

export function WebsiteDeleteForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { websitesUrl } = useContext(SettingsContext);
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: any) => del(`${websitesUrl}/${websiteId}`, data),
  });

  const handleConfirm = async () => {
    mutate(null, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <TypeConfirmationForm
      confirmationValue={CONFIRM_VALUE}
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={error}
      buttonLabel={formatMessage(labels.delete)}
      buttonVariant="danger"
    />
  );
}

export default WebsiteDeleteForm;
