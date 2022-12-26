import UserDeleteForm from 'components/forms/UserDeleteForm';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Form, FormRow, Modal } from 'react-basics';

export default function UserDelete({ userId, onSave }) {
  const [modal, setModal] = useState(null);
  const router = useRouter();

  const handleDelete = async () => {
    onSave();
    await router.push('/users');
  };

  const handleClose = () => setModal(null);

  return (
    <Form>
      <FormRow label="Delete user">
        <p>All user data will be deleted.</p>
        <Button onClick={() => setModal('delete')}>Delete</Button>
      </FormRow>
      {modal === 'delete' && (
        <Modal title="Delete user" onClose={handleClose}>
          {close => <UserDeleteForm userId={userId} onSave={handleDelete} onClose={close} />}
        </Modal>
      )}
    </Form>
  );
}
