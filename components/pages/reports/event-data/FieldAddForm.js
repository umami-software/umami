import { useMessages } from 'hooks';
import { Button, Form, FormButtons, FormRow } from 'react-basics';

export function FieldAddForm({ onClose }) {
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Form>
      <FormRow label={formatMessage(labels.url)}></FormRow>
      <FormButtons align="center" flex>
        <Button variant="primary" onClick={handleSave}>
          {formatMessage(labels.save)}
        </Button>
        <Button onClick={handleClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default FieldAddForm;
