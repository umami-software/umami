import { useState } from 'react';
import { useMessages } from 'hooks';
import { Button, Form, FormButtons, FormRow, TextField } from 'react-basics';
import styles from './UrlAddForm.module.css';

export function UrlAddForm({ defaultValue = '', onSave, onClose }) {
  const [url, setUrl] = useState(defaultValue);
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {
    onSave?.(url);
    setUrl('');
    onClose();
  };

  const handleChange = e => {
    setUrl(e.target.value);
  };

  const handleClose = () => {
    setUrl('');
    onClose();
  };

  return (
    <Form className={styles.form}>
      <FormRow label={formatMessage(labels.url)}>
        <TextField
          name="url"
          value={url}
          onChange={handleChange}
          autoFocus={true}
          autoComplete="off"
        />
      </FormRow>
      <FormButtons align="center" flex>
        <Button variant="primary" onClick={handleSave}>
          {formatMessage(labels.save)}
        </Button>
        <Button onClick={handleClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default UrlAddForm;
