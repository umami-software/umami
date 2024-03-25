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
  Loading,
} from 'react-basics';
import { useMessages, useFilters, useFormat, useLocale, useWebsiteValues } from 'components/hooks';
import { safeDecodeURIComponent } from 'next-basics';
import { OPERATORS } from 'lib/constants';
import styles from './FieldFilterEditForm.module.css';

export interface FieldFilterFormProps {
  websiteId?: string;
  name: string;
  label?: string;
  type: string;
  defaultValue?: string;
  onChange?: (filter: { name: string; type: string; filter: string; value: string }) => void;
  allowFilterSelect?: boolean;
  isNew?: boolean;
}

export default function FieldFilterEditForm({
  websiteId,
  name,
  label,
  type,
  defaultValue,
  onChange,
  allowFilterSelect = true,
  isNew,
}: FieldFilterFormProps) {
  const { formatMessage, labels } = useMessages();
  const [filter, setFilter] = useState('eq');
  const [value, setValue] = useState(defaultValue ?? '');
  const { getFilters } = useFilters();
  const { formatValue } = useFormat();
  const { locale } = useLocale();
  const filters = getFilters(type);
  const { data: values = [], isLoading } = useWebsiteValues(websiteId, name);

  const formattedValues = useMemo(() => {
    if (!values) {
      return {};
    }
    const formatted = {};
    const format = (val: string) => {
      formatted[val] = formatValue(val, name);
      return formatted[val];
    };

    if (values?.length !== 1) {
      const { compare } = new Intl.Collator(locale, { numeric: true });
      values.sort((a, b) => compare(formatted[a] ?? format(a), formatted[b] ?? format(b)));
    } else {
      format(values[0]);
    }

    return formatted;
  }, [formatValue, locale, name, values]);

  const filteredValues = useMemo(() => {
    return value
      ? values.filter(n => formattedValues[n].toLowerCase().includes(value.toLowerCase()))
      : values;
  }, [value, formattedValues]);

  const renderFilterValue = value => {
    return filters.find(f => f.value === value)?.label;
  };

  const handleAdd = () => {
    onChange({ name, type, filter, value });
  };

  const handleMenuSelect = value => {
    setValue(value);
  };

  const showMenu =
    [OPERATORS.equals, OPERATORS.notEquals].includes(filter as any) &&
    !(filteredValues?.length === 1 && filteredValues[0] === formattedValues[value]);

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
              placeholder={formatMessage(labels.enter)}
              onChange={e => setValue(e.target.value)}
            />
            {showMenu && (
              <Popup className={styles.popup} alignment="start">
                <ResultsMenu
                  values={filteredValues}
                  type={name}
                  isLoading={isLoading}
                  onSelect={handleMenuSelect}
                />
              </Popup>
            )}
          </PopupTrigger>
        </Flexbox>
        <Button variant="primary" onClick={handleAdd} disabled={!filter || !value}>
          {isNew ? formatMessage(labels.add) : formatMessage(labels.update)}
        </Button>
      </FormRow>
    </Form>
  );
}

const ResultsMenu = ({ values, type, isLoading, onSelect }) => {
  const { formatValue } = useFormat();
  if (isLoading) {
    return <Loading icon="dots" position="center" />;
  }

  if (!values?.length) {
    return null;
  }

  return (
    <Menu variant="popup" onSelect={onSelect}>
      {values?.map(value => {
        return <Item key={value}>{safeDecodeURIComponent(formatValue(value, type))}</Item>;
      })}
    </Menu>
  );
};
