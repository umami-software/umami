import { Button, Icon, Icons, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import WebsiteAddForm from './WebsiteAddForm';
import useMessages from 'components/hooks/useMessages';
import { setValue } from 'store/cache';

export function WebsiteAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();

  const handleSave = async () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    setValue('websites', Date.now());
    onSave?.();
  };

  return (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.addWebsite)}</Text>
      </Button>
      <Modal title={formatMessage(labels.addWebsite)}>
        {(close: () => void) => <WebsiteAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default WebsiteAddButton;
