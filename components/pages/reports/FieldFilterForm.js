import { useState } from 'react';
import { Form, FormRow, Item, Flexbox, Dropdown, Button } from 'react-basics';
import { useFilters } from 'hooks';
import styles from './FieldFilterForm.module.css';

export default function FieldFilterForm({ label, type, values, onSelect }) {
  const [filter, setFilter] = useState('eq');
  const [value, setValue] = useState();
  const filters = useFilters(type);

  const renderFilterValue = value => {
    return filters.find(f => f.value === value)?.label;
  };

  return (
    <Form>
      <FormRow label={label} className={styles.filter}>
        <Flexbox gap={10}>
          <Dropdown
            className={styles.dropdown}
            items={filters}
            value={filter}
            renderValue={renderFilterValue}
            onChange={setFilter}
          >
            {({ value, label }) => {
              return <Item key={value}>{label}</Item>;
            }}
          </Dropdown>
          <Dropdown className={styles.values} items={values} value={value} onChange={setValue}>
            {value => {
              return <Item key={value}>{value}</Item>;
            }}
          </Dropdown>
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
