import WebsiteDeleteForm from 'components/pages/settings/websites/WebsiteDeleteForm';
import WebsiteResetForm from 'components/pages/settings/websites/WebsiteResetForm';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Form, FormRow, Modal } from 'react-basics';

export default function WebsiteReset({ websiteId, onSave }) {
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
      <FormRow label="Reset website">
        <p>
          All statistics for this website will be deleted, but your settings will remain intact.
        </p>
        <Button onClick={() => setModal('reset')}>Reset</Button>
      </FormRow>
      <FormRow label="Delete website">
        <p>All website data will be deleted.</p>
        <Button onClick={() => setModal('delete')}>Delete</Button>
      </FormRow>
      {modal === 'reset' && (
        <Modal title="Reset website" onClose={handleClose}>
          {close => <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />}
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Delete website" onClose={handleClose}>
          {close => (
            <WebsiteDeleteForm websiteId={websiteId} onSave={handleDelete} onClose={close} />
          )}
        </Modal>
      )}
    </Form>
  );
}
