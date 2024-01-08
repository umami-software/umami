import { useState } from 'react';
import { Button, LoadingButton, Form, FormButtons } from 'react-basics';
import useMessages from 'components/hooks/useMessages';

export interface ConfirmDeleteFormProps {
  name: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

export function ConfirmDeleteForm({ name, onConfirm, onClose }: ConfirmDeleteFormProps) {
  const [loading, setLoading] = useState(false);
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();

  const handleConfirm = () => {
    setLoading(true);
    onConfirm();
  };

  return (
    <Form>
      <p>
        <FormattedMessage {...messages.confirmDelete} values={{ target: <b>{name}</b> }} />
      </p>
      <FormButtons flex>
        <LoadingButton isLoading={loading} onClick={handleConfirm} variant="danger">
          {formatMessage(labels.delete)}
        </LoadingButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default ConfirmDeleteForm;
