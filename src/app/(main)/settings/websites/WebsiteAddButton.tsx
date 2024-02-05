'use client';
import { Button, Icon, Icons, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import WebsiteAddForm from './WebsiteAddForm';
import { useMessages } from 'components/hooks';
import { touch } from 'store/modified';

export function WebsiteAddButton({ teamId, onSave }: { teamId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();

  const handleSave = async () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    touch('websites');
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
        {(close: () => void) => (
          <WebsiteAddForm teamId={teamId} onSave={handleSave} onClose={close} />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default WebsiteAddButton;
