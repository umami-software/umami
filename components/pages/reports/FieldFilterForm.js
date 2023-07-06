import { useState } from 'react';
import { Form, FormRow, Menu, Item, Flexbox, Dropdown, TextField, Button } from 'react-basics';
import { useFilters } from 'hooks';
import styles from './FieldFilterForm.module.css';

export default function FieldFilterForm({ name, type, onSelect }) {
  const [filter, setFilter] = useState('');
  const [value, setValue] = useState('');
  const { filters, types } = useFilters();
  const items = types[type];

  const renderValue = value => {
    return filters[value];
  };

  if (type === 'boolean') {
    return (
      <Form>
        <FormRow label={name}>
          <Menu onSelect={value => onSelect({ name, type, value: ['eq', value] })}>
            {items.map(value => {
              return <Item key={value}>{filters[value]}</Item>;
            })}
          </Menu>
        </FormRow>
      </Form>
    );
  }

  return (
    <Form>
      <FormRow label={name} className={styles.filter}>
        <Flexbox gap={10}>
          <Dropdown
            className={styles.dropdown}
            items={items}
            value={filter}
            renderValue={renderValue}
            onChange={setFilter}
          >
            {value => {
              return <Item key={value}>{filters[value]}</Item>;
            }}
          </Dropdown>
          <TextField value={value} onChange={e => setValue(e.target.value)} autoFocus={true} />
        </Flexbox>
        <Button
          variant="primary"
          onClick={() => onSelect({ name, type, value: [filter, value] })}
          disabled={!filter || !value}
        >
          Add
        </Button>
      </FormRow>
    </Form>
  );
}
