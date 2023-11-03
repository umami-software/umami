import { useState, useMemo } from 'react';
import { Form, FormRow, Item, Flexbox, Dropdown, Button } from 'react-basics';
import { useMessages, useFilters, useFormat, useLocale } from 'components/hooks';
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
  const { locale } = useLocale();
  const filters = getFilters(type);

  const formattedValues = useMemo(() => {
    const formatted = {};
    const { compare } = new Intl.Collator(locale, { numeric: true });
    const format = val => {
      formatted[val] = formatValue(val, name);
      return formatted[val];
    };
    values.sort((a, b) => compare(formatted[a] ?? format(a), formatted[b] ?? format(b)));
    return formatted;
  }, [values]);

  const renderFilterValue = value => {
    return filters.find(f => f.value === value)?.label;
  };

  const renderValue = value => {
    return formattedValues[value];
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
              return <Item key={value}>{formattedValues[value]}</Item>;
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
