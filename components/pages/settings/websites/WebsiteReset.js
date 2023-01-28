import { Button, Form, FormRow, Modal, ModalTrigger } from 'react-basics';
import { useIntl } from 'react-intl';
import WebsiteDeleteForm from 'components/pages/settings/websites/WebsiteDeleteForm';
import WebsiteResetForm from 'components/pages/settings/websites/WebsiteResetForm';
import { labels, messages } from 'components/messages';

export default function WebsiteReset({ websiteId, onSave }) {
  const { formatMessage } = useIntl();

  const handleReset = async () => {
    onSave('reset');
  };

  const handleDelete = async () => {
    onSave('delete');
  };

  return (
    <Form>
      <FormRow label={formatMessage(labels.resetWebsite)}>
        <p>{formatMessage(messages.resetWebsiteWarning)}</p>
        <ModalTrigger>
          <Button>{formatMessage(labels.reset)}</Button>
          <Modal title={formatMessage(labels.resetWebsite)}>
            {close => (
              <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </FormRow>
      <FormRow label={formatMessage(labels.deleteWebsite)}>
        <p>{formatMessage(messages.deleteWebsiteWarning)}</p>
        <ModalTrigger>
          <Button>Delete</Button>
          <Modal title={formatMessage(labels.deleteWebsite)}>
            {close => (
              <WebsiteDeleteForm websiteId={websiteId} onSave={handleDelete} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </FormRow>
    </Form>
  );
}
