import { useMemo, useState } from 'react';
import { useFilters, useFormat, useMessages, useWebsiteValues } from '@/components/hooks';
import { OPERATORS } from '@/lib/constants';
import { isEqualsOperator } from '@/lib/params';
import {
  Button,
  Dropdown,
  Flexbox,
  Form,
  FormRow,
  Icon,
  Icons,
  Item,
  Loading,
  Menu,
  SearchField,
  Text,
  TextField,
} from 'react-basics';
import styles from './FieldFilterEditForm.module.css';

export interface FieldFilterFormProps {
  websiteId?: string;
  name: string;
  label?: string;
  type: string;
  startDate: Date;
  endDate: Date;
  operator?: string;
  defaultValue?: string;
  onChange?: (filter: { name: string; type: string; operator: string; value: string }) => void;
  allowFilterSelect?: boolean;
  isNew?: boolean;
}

export default function FieldFilterEditForm({
  websiteId,
  name,
  label,
  type,
  startDate,
  endDate,
  operator: defaultOperator = 'eq',
  defaultValue = '',
  onChange,
  allowFilterSelect = true,
  isNew,
}: FieldFilterFormProps) {
  const { formatMessage, labels } = useMessages();
  const [operator, setOperator] = useState(defaultOperator);
  const [value, setValue] = useState(defaultValue);
  const [showMenu, setShowMenu] = useState(false);
  const isEquals = isEqualsOperator(operator);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(isEquals ? value : '');
  const { filters } = useFilters();
  const { formatValue } = useFormat();
  const isDisabled = !operator || (isEquals && !selected) || (!isEquals && !value);
  const {
    data: values = [],
    isLoading,
    refetch,
  } = useWebsiteValues({
    websiteId,
    type: name,
    startDate,
    endDate,
    search,
  });

  const filterDropdownItems = (name: string) => {
    const limitedFilters = ['country', 'region', 'city'];

    if (limitedFilters.includes(name)) {
      return filters.filter(f => f.type === type && !f.label.match(/contain/gi));
    } else {
      return filters.filter(f => f.type === type);
    }
  };

  const formattedValues = useMemo(() => {
    return values.reduce((obj: { [x: string]: string }, { value }: { value: string }) => {
      obj[value] = formatValue(value, name);

      return obj;
    }, {});
  }, [formatValue, name, values]);

  const filteredValues = useMemo(() => {
    return value
      ? values.filter((n: string | number) =>
          formattedValues[n]?.toLowerCase()?.includes(value.toLowerCase()),
        )
      : values;
  }, [value, formattedValues]);

  const renderFilterValue = (value: any) => {
    return filters.find((filter: { value: any }) => filter.value === value)?.label;
  };

  const handleAdd = () => {
    onChange({ name, type, operator, value: isEquals ? selected : value });
  };

  const handleMenuSelect = (value: string) => {
    setSelected(value);
    setShowMenu(false);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleReset = () => {
    setSelected('');
    setValue('');
    setSearch('');
    refetch();
  };

  const handleOperatorChange = (value: any) => {
    setOperator(value);

    if ([OPERATORS.equals, OPERATORS.notEquals].includes(value)) {
      setValue('');
    } else {
      setSelected('');
    }
  };

  const handleBlur = () => {
    window.setTimeout(() => setShowMenu(false), 500);
  };

  return (
    <Form>
      <FormRow label={label} className={styles.filter}>
        <Flexbox gap={10}>
          {allowFilterSelect && (
            <Dropdown
              className={styles.dropdown}
              items={filterDropdownItems(name)}
              value={operator}
              renderValue={renderFilterValue}
              onChange={handleOperatorChange}
            >
              {({ value, label }) => {
                return <Item key={value}>{label}</Item>;
              }}
            </Dropdown>
          )}
          {selected && isEquals && (
            <div className={styles.selected} onClick={handleReset}>
              <Text>{formatValue(selected, name)}</Text>
              <Icon>
                <Icons.Close />
              </Icon>
            </div>
          )}
          {!selected && isEquals && (
            <div className={styles.search}>
              <SearchField
                className={styles.text}
                value={value}
                placeholder={formatMessage(labels.enter)}
                onChange={e => setValue(e.target.value)}
                onSearch={handleSearch}
                delay={500}
                onFocus={() => setShowMenu(true)}
                onBlur={handleBlur}
              />
              {showMenu && (
                <ResultsMenu
                  values={filteredValues}
                  type={name}
                  isLoading={isLoading}
                  onSelect={handleMenuSelect}
                />
              )}
            </div>
          )}
          {!selected && !isEquals && (
            <TextField
              className={styles.text}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          )}
        </Flexbox>
        <Button variant="primary" onClick={handleAdd} disabled={isDisabled}>
          {formatMessage(isNew ? labels.add : labels.update)}
        </Button>
      </FormRow>
    </Form>
  );
}

const ResultsMenu = ({ values, type, isLoading, onSelect }) => {
  const { formatValue } = useFormat();
  if (isLoading) {
    return (
      <Menu className={styles.menu} variant="popup">
        <Item>
          <Loading icon="dots" position="center" />
        </Item>
      </Menu>
    );
  }

  if (!values?.length) {
    return null;
  }

  return (
    <Menu className={styles.menu} variant="popup" onSelect={onSelect}>
      {values?.map(({ value }) => {
        return <Item key={value}>{formatValue(value, type)}</Item>;
      })}
    </Menu>
  );
};
