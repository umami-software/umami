import { useState, useMemo } from 'react';
import {
  Form,
  FormRow,
  Item,
  Flexbox,
  Dropdown,
  Button,
  TextField,
  Menu,
  Popup,
  PopupTrigger,
} from 'react-basics';
import { useMessages, useFilters, useFormat, useLocale } from 'components/hooks';
import { safeDecodeURIComponent } from 'next-basics';
import { OPERATORS } from 'lib/constants';
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
  const [value, setValue] = useState('');
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
  }, [formatValue, locale, name, values]);

  const filteredValues = useMemo(() => {
    return value ? values.filter(n => n.includes(value)) : values;
  }, [value, formattedValues]);

  const renderFilterValue = value => {
    return filters.find(f => f.value === value)?.label;
  };

  const handleAdd = () => {
    onSelect({ name, type, filter, value });
  };

  const handleMenuSelect = value => {
    setValue(value);
  };

  const showMenu =
    [OPERATORS.equals, OPERATORS.notEquals].includes(filter as any) &&
    !(filteredValues.length === 1 && filteredValues[0] === value);

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
          <PopupTrigger>
            <TextField
              className={styles.text}
              value={decodeURIComponent(value)}
              onChange={e => setValue(e.target.value)}
            />
            {showMenu && (
              <Popup className={styles.popup} alignment="end">
                {filteredValues.length > 0 && (
                  <Menu variant="popup" onSelect={handleMenuSelect}>
                    {filteredValues.map(value => {
                      return <Item key={value}>{safeDecodeURIComponent(value)}</Item>;
                    })}
                  </Menu>
                )}
              </Popup>
            )}
          </PopupTrigger>
        </Flexbox>
        <Button variant="primary" onClick={handleAdd} disabled={!filter || !value}>
          {formatMessage(labels.add)}
        </Button>
      </FormRow>
    </Form>
  );
}
