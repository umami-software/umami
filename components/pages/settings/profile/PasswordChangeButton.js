import { Button, Icon, Text, useToast, ModalTrigger, Modal } from 'react-basics';
import PasswordEditForm from 'components/pages/settings/profile/PasswordEditForm';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';

export default function PasswordChangeButton() {
  const { formatMessage, labels, messages } = useMessages();
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
      {toast}
      <ModalTrigger modalProps={{ title: formatMessage(labels.changePassword) }}>
        <Button>
          <Icon>
            <Icons.Lock />
          </Icon>
          <Text>{formatMessage(labels.changePassword)}</Text>
        </Button>
        <Modal>{close => <PasswordEditForm onSave={handleSave} onClose={close} />}</Modal>
      </ModalTrigger>
    </>
  );
}
