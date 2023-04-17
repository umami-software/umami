import { Button, Modal, ModalTrigger, ActionForm } from 'react-basics';
import WebsiteDeleteForm from 'components/pages/settings/websites/WebsiteDeleteForm';
import WebsiteResetForm from 'components/pages/settings/websites/WebsiteResetForm';
import useMessages from 'hooks/useMessages';

export default function WebsiteData({ websiteId, onSave }) {
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
            {close => (
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
          <Button variant="danger">Delete</Button>
          <Modal title={formatMessage(labels.deleteWebsite)}>
            {close => (
              <WebsiteDeleteForm websiteId={websiteId} onSave={handleDelete} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
    </>
  );
}
