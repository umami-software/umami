import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMessages } from 'hooks';
import { Button, Form, FormRow, TextField, Flexbox } from 'react-basics';
import styles from './UrlAddForm.module.css';

export function UrlAddForm({ defaultValue = '', style, onSave, onClose }) {
  const [url, setUrl] = useState(defaultValue);
  const { formatMessage, labels } = useMessages();

  const handleSave = e => {
    e?.stopPropagation?.();
    onSave?.(url);
    setUrl('');
    onClose();
  };

  const handleChange = e => {
    setUrl(e.target.value);
  };

  const handleClick = e => {
    e.stopPropagation();
  };

  return createPortal(
    <Form className={styles.form} onSubmit={handleSave} style={style} onClick={handleClick}>
      <FormRow label={formatMessage(labels.url)}>
        <Flexbox gap={10}>
          <TextField
            className={styles.input}
            name="url"
            value={url}
            onChange={handleChange}
            autoFocus={true}
            autoComplete="off"
          />
          <Button variant="primary" onClick={handleSave}>
            {formatMessage(labels.add)}
          </Button>
        </Flexbox>
      </FormRow>
    </Form>,
    document.body,
  );
}

export default UrlAddForm;
