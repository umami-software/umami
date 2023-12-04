import { useState, useMemo } from 'react';
import { Form, FormRow, Item, Flexbox, Dropdown, Button } from 'react-basics';
import { useMessages, useFilters, useFormat, useLocale } from 'components/hooks';
import styles from './FieldFilterForm.module.css';

export interface FieldFilterFormProps {
  name: string;
  label?: string;
  type: string;
  values?: any[];
  onSelect?: (key: any) => void;
  allowFilterSelect?: boolean;
}

export default function FieldFilterForm({
  name,
  label,
  type,
  values,
  onSelect,
  allowFilterSelect = true,
}: FieldFilterFormProps) {
  const { formatMessage, labels } = useMessages();
  const [filter, setFilter] = useState('eq');
  const [value, setValue] = useState();
  const { getFilters } = useFilters();
  const { formatValue } = useFormat();
  const { locale } = useLocale();
  const filters = getFilters(type);

  const formattedValues = useMemo(() => {
    const formatted = {};
    const format = (val: string) => {
      formatted[val] = formatValue(val, name);
      return formatted[val];
    };
    if (values.length !== 1) {
      const { compare } = new Intl.Collator(locale, { numeric: true });
      values.sort((a, b) => compare(formatted[a] ?? format(a), formatted[b] ?? format(b)));
    } else {
      format(values[0]);
    }
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
              onChange={(key: any) => setFilter(key)}
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
            onChange={(key: any) => setValue(key)}
            style={{
              minWidth: '250px',
            }}
          >
            {(value: string) => {
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
