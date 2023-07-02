import { useState } from 'react';
import { useMessages } from 'hooks';
import { Button, Form, FormRow, TextField, Flexbox } from 'react-basics';
import styles from './UrlAddForm.module.css';
import PopupForm from '../PopupForm';

export function UrlAddForm({ defaultValue = '', element, onAdd, onClose }) {
  const [url, setUrl] = useState(defaultValue);
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {
    onAdd(url);
    setUrl('');
    onClose();
  };

  const handleChange = e => {
    setUrl(e.target.value);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleSave();
    }
  };

  return (
    <PopupForm element={element}>
      <Form>
        <FormRow label={formatMessage(labels.url)}>
          <Flexbox gap={10}>
            <TextField
              className={styles.input}
              value={url}
              onChange={handleChange}
              autoFocus={true}
              autoComplete="off"
              onKeyDown={handleKeyDown}
            />
            <Button variant="primary" onClick={handleSave}>
              {formatMessage(labels.add)}
            </Button>
          </Flexbox>
        </FormRow>
      </Form>
    </PopupForm>
  );
}

export default UrlAddForm;
