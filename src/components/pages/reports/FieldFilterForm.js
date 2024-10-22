import { useState } from 'react';
import { Form, FormRow, Item, Flexbox, Dropdown, Button } from 'react-basics';
import { useMessages, useFilters, useFormat } from 'components/hooks';
import styles from './FieldFilterForm.module.css';

export default function FieldFilterForm({
  name,
  label,
  type,
  values,
  onSelect,
  allowFilterSelect = true,
}) {
  const { formatMessage, labels } = useMessages();
  const [filter, setFilter] = useState('eq');
  const [value, setValue] = useState();
  const { getFilters } = useFilters();
  const { formatValue } = useFormat();
  const filters = getFilters(type);

  const renderFilterValue = value => {
    return filters.find(f => f.value === value)?.label;
  };

  const renderValue = value => {
    return formatValue(value, name);
  };

  const handleAdd = () => {
    onSelect({ name, type, filter, value });
  };

  return (
    <Form>
      <FormRow label={label} className={styles.filter}>
        <Flexbox gap={10}>
          {allowFilterSelect && (
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
          )}
          <Dropdown
            className={styles.dropdown}
            menuProps={{ className: styles.menu }}
            items={values}
            value={value}
            renderValue={renderValue}
            onChange={setValue}
            style={{
              minWidth: '250px',
            }}
          >
            {value => {
              return <Item key={value}>{formatValue(value, name)}</Item>;
            }}
          </Dropdown>
        </Flexbox>
        <Button variant="primary" onClick={handleAdd} disabled={!filter || !value}>
          {formatMessage(labels.add)}
        </Button>
      </FormRow>
    </Form>
  );
}
