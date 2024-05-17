import { useMessages } from 'components/hooks';
import { useState } from 'react';
import { Button, Dropdown, Flexbox, FormRow, Item, TextField } from 'react-basics';
import styles from './GoalsAddForm.module.css';

export function GoalsAddForm({
  type: defaultType = 'url',
  value: defaultValue = '',
  goal: defaultGoal = 10,
  onChange,
}: {
  type?: string;
  value?: string;
  goal?: number;
  onChange?: (step: { type: string; value: string; goal: number }) => void;
}) {
  const [type, setType] = useState(defaultType);
  const [value, setValue] = useState(defaultValue);
  const [goal, setGoal] = useState(defaultGoal);
  const { formatMessage, labels } = useMessages();
  const items = [
    { label: formatMessage(labels.url), value: 'url' },
    { label: formatMessage(labels.event), value: 'event' },
  ];
  const isDisabled = !type || !value;

  const handleSave = () => {
    onChange({ type, value, goal });
    setValue('');
    setGoal(10);
  };

  const handleChange = (e, set) => {
    set(e.target.value);
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
            onChange={e => handleChange(e, setValue)}
            autoFocus={true}
            autoComplete="off"
            onKeyDown={handleKeyDown}
          />
        </Flexbox>
      </FormRow>
      <FormRow label={formatMessage(labels.goal)}>
        <Flexbox gap={10}>
          <TextField
            className={styles.input}
            value={goal?.toString()}
            onChange={e => handleChange(e, setGoal)}
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

export default GoalsAddForm;
