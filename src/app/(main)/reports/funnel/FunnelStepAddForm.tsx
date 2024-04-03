import { useState } from 'react';
import { useMessages } from 'components/hooks';
import { Button, FormRow, TextField, Flexbox, Dropdown, Item } from 'react-basics';
import styles from './FunnelStepAddForm.module.css';

export interface FunnelStepAddFormProps {
  type?: string;
  value?: string;
  onChange?: (step: { type: string; value: string }) => void;
}

export function FunnelStepAddForm({
  type: defaultType = 'url',
  value: defaultValue = '',
  onChange,
}: FunnelStepAddFormProps) {
  const [type, setType] = useState(defaultType);
  const [value, setValue] = useState(defaultValue);
  const { formatMessage, labels } = useMessages();
  const items = [
    { label: formatMessage(labels.url), value: 'url' },
    { label: formatMessage(labels.event), value: 'event' },
  ];
  const isDisabled = !type || !value;

  const handleSave = () => {
    onChange({ type, value });
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
    <Flexbox direction="column" gap={10}>
      <FormRow label={formatMessage(defaultValue ? labels.update : labels.add)}>
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
        </Flexbox>
      </FormRow>
      <FormRow>
        <Button variant="primary" onClick={handleSave} disabled={isDisabled}>
          {formatMessage(defaultValue ? labels.update : labels.add)}
        </Button>
      </FormRow>
    </Flexbox>
  );
}

export default FunnelStepAddForm;
