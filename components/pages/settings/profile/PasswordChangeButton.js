import { Button, Icon, Text, useToast, ModalTrigger, Modal } from 'react-basics';
import PasswordEditForm from 'components/pages/settings/profile/PasswordEditForm';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';

export function PasswordChangeButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
      {toast}
      <ModalTrigger>
        <Button>
          <Icon>
            <Icons.Lock />
          </Icon>
          <Text>{formatMessage(labels.changePassword)}</Text>
        </Button>
        <Modal title={formatMessage(labels.changePassword)}>
          {close => <PasswordEditForm onSave={handleSave} onClose={close} />}
        </Modal>
      </ModalTrigger>
    </>
  );
}

export default PasswordChangeButton;
