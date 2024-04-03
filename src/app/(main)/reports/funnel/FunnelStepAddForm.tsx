import { useState } from 'react';
import { useMessages } from 'components/hooks';
import { Button, FormRow, TextField, Flexbox, Dropdown, Item } from 'react-basics';
import styles from './FunnelStepAddForm.module.css';

export interface UrlAddFormProps {
  defaultValue?: string;
  onAdd?: (step: { type: string; value: string }) => void;
}

export function FunnelStepAddForm({ defaultValue = '', onAdd }: UrlAddFormProps) {
  const [type, setType] = useState('url');
  const [value, setValue] = useState(defaultValue);
  const { formatMessage, labels } = useMessages();
  const items = [
    { label: formatMessage(labels.url), value: 'url' },
    { label: formatMessage(labels.event), value: 'event' },
  ];
  const isDisabled = !type || !value;

  const handleSave = () => {
    onAdd({ type, value });
    setValue('');
  };

  const handleChange = e => {
    setValue(e.target.value);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleSave();
    }
  };

  const renderTypeValue = (value: any) => {
    return items.find(item => item.value === value)?.label;
  };

  return (
    <FormRow label={formatMessage(labels.addStep)}>
      <Flexbox gap={10}>
        <Dropdown
          className={styles.dropdown}
          items={items}
          value={type}
          renderValue={renderTypeValue}
          onChange={(value: any) => setType(value)}
        >
          {({ value, label }) => {
            return <Item key={value}>{label}</Item>;
          }}
        </Dropdown>
        <TextField
          className={styles.input}
          value={value}
          onChange={handleChange}
          autoFocus={true}
          autoComplete="off"
          onKeyDown={handleKeyDown}
        />
        <Button variant="primary" onClick={handleSave} disabled={isDisabled}>
          {formatMessage(labels.add)}
        </Button>
      </Flexbox>
    </FormRow>
  );
}

export default FunnelStepAddForm;
