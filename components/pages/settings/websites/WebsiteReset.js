import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Form, FormRow, Modal } from 'react-basics';
import { useIntl } from 'react-intl';
import WebsiteDeleteForm from 'components/pages/settings/websites/WebsiteDeleteForm';
import WebsiteResetForm from 'components/pages/settings/websites/WebsiteResetForm';
import { labels, messages } from 'components/messages';

export default function WebsiteReset({ websiteId, onSave }) {
  const { formatMessage } = useIntl();
  const [modal, setModal] = useState(null);
  const router = useRouter();

  const handleReset = async () => {
    setModal(null);
    onSave();
  };

  const handleDelete = async () => {
    onSave();
    await router.push('/websites');
  };

  const handleClose = () => setModal(null);

  return (
    <Form>
      <FormRow label={formatMessage(labels.resetWebsite)}>
        <p>{formatMessage(messages.resetWebsiteWarning)}</p>
        <Button onClick={() => setModal('reset')}>{formatMessage(labels.reset)}</Button>
      </FormRow>
      <FormRow label={formatMessage(labels.deleteWebsite)}>
        <p>{formatMessage(messages.deleteWebsiteWarning)}</p>
        <Button onClick={() => setModal('delete')}>Delete</Button>
      </FormRow>
      {modal === 'reset' && (
        <Modal title={formatMessage(labels.resetWebsite)} onClose={handleClose}>
          {close => <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />}
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title={formatMessage(labels.deleteWebsite)} onClose={handleClose}>
          {close => (
            <WebsiteDeleteForm websiteId={websiteId} onSave={handleDelete} onClose={close} />
          )}
        </Modal>
      )}
    </Form>
  );
}
