import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import {
  Button,
  Column,
  Row,
  TextField,
  Label,
  Select,
  ListItem,
  FormButtons,
} from '@umami/react-zen';
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

  return (
    <Column gap="3">
      <Label>{formatMessage(defaultValue ? labels.update : labels.add)}</Label>
      <Row gap="3">
        <Select
          className={styles.dropdown}
          items={items}
          value={type}
          onChange={(value: any) => setType(value)}
        >
          {({ value, label }: any) => {
            return <ListItem key={value}>{label}</ListItem>;
          }}
        </Select>
        <TextField
          className={styles.input}
          value={value}
          onChange={handleChange}
          autoFocus={true}
          autoComplete="off"
          onKeyDown={handleKeyDown}
        />
      </Row>
      <FormButtons>
        <Button variant="primary" onPress={handleSave} isDisabled={isDisabled}>
          {formatMessage(defaultValue ? labels.update : labels.add)}
        </Button>
      </FormButtons>
    </Column>
  );
}
