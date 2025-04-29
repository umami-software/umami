import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import {
  Button,
  FormButtons,
  FormField,
  TextField,
  Row,
  Column,
  Select,
  ListItem,
} from '@umami/react-zen';

export interface AttributionStepAddFormProps {
  type?: string;
  value?: string;
  onChange?: (step: { type: string; value: string }) => void;
}

export function AttributionStepAddForm({
  type: defaultType = 'url',
  value: defaultValue = '',
  onChange,
}: AttributionStepAddFormProps) {
  const [type, setType] = useState(defaultType);
  const [value, setValue] = useState(defaultValue);
  const { formatMessage, labels } = useMessages();
  const items = [
    { id: 'url', label: formatMessage(labels.url), value: 'url' },
    { id: 'event', label: formatMessage(labels.event), value: 'event' },
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
    <Column gap>
      <FormField name="steps" label={formatMessage(defaultValue ? labels.update : labels.add)}>
        <Row>
          <Select items={items} value={type} onChange={(value: any) => setType(value)}>
            {({ value, label }: any) => {
              return <ListItem key={value}>{label}</ListItem>;
            }}
          </Select>
          <TextField
            value={value}
            onChange={handleChange}
            autoFocus={true}
            autoComplete="off"
            onKeyDown={handleKeyDown}
          />
        </Row>
      </FormField>
      <FormButtons>
        <Button variant="primary" onClick={handleSave} isDisabled={isDisabled}>
          {formatMessage(defaultValue ? labels.update : labels.add)}
        </Button>
      </FormButtons>
    </Column>
  );
}

export default AttributionStepAddForm;
