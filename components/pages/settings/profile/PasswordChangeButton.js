import { Button, Icon, Text, useToasts, ModalTrigger, Modal } from 'react-basics';
import PasswordEditForm from 'components/pages/settings/profile/PasswordEditForm';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';

export function PasswordChangeButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
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
