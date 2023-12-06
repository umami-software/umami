import { Button, Modal, ModalTrigger, ActionForm } from 'react-basics';
import WebsiteDeleteForm from './WebsiteDeleteForm';
import WebsiteResetForm from './WebsiteResetForm';
import useMessages from 'components/hooks/useMessages';

export function WebsiteData({
  websiteId,
  onSave,
}: {
  websiteId: string;
  onSave?: (value: string) => void;
}) {
  const { formatMessage, labels, messages } = useMessages();

  const handleReset = async () => {
    onSave('reset');
  };

  const handleDelete = async () => {
    onSave('delete');
  };

  return (
    <>
      <ActionForm
        label={formatMessage(labels.resetWebsite)}
        description={formatMessage(messages.resetWebsiteWarning)}
      >
        <ModalTrigger>
          <Button variant="secondary">{formatMessage(labels.reset)}</Button>
          <Modal title={formatMessage(labels.resetWebsite)}>
            {(close: () => void) => (
              <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
      <ActionForm
        label={formatMessage(labels.deleteWebsite)}
        description={formatMessage(messages.deleteWebsiteWarning)}
      >
        <ModalTrigger>
          <Button variant="danger">{formatMessage(labels.delete)}</Button>
          <Modal title={formatMessage(labels.deleteWebsite)}>
            {(close: () => void) => (
              <WebsiteDeleteForm websiteId={websiteId} onSave={handleDelete} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
    </>
  );
}

export default WebsiteData;
