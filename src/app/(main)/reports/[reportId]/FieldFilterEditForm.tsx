import { useMemo, useState } from 'react';
import { useFilters, useFormat, useMessages, useWebsiteValuesQuery } from '@/components/hooks';
import { OPERATORS } from '@/lib/constants';
import { isEqualsOperator } from '@/lib/params';
import {
  Button,
  Column,
  Row,
  Select,
  Flexbox,
  Icon,
  Icons,
  Loading,
  Menu,
  MenuItem,
  ListItem,
  SearchField,
  Text,
  TextField,
  Label,
} from '@umami/react-zen';
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

export function FieldFilterEditForm({
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
  } = useWebsiteValuesQuery({
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
    <Column>
      <Row className={styles.filter}>
        <Label>{label}</Label>
        <Flexbox gap="3">
          {allowFilterSelect && (
            <Select
              className={styles.dropdown}
              items={filterDropdownItems(name)}
              value={operator}
              onChange={handleOperatorChange}
            >
              {({ value, label }: any) => {
                return <ListItem key={value}>{label}</ListItem>;
              }}
            </Select>
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
        <Button variant="primary" onPress={handleAdd} isDisabled={isDisabled}>
          {formatMessage(isNew ? labels.add : labels.update)}
        </Button>
      </Row>
    </Column>
  );
}

const ResultsMenu = ({ values, type, isLoading, onSelect }) => {
  const { formatValue } = useFormat();
  if (isLoading) {
    return (
      <Menu className={styles.menu}>
        <MenuItem>
          <Loading icon="dots" position="center" />
        </MenuItem>
      </Menu>
    );
  }

  if (!values?.length) {
    return null;
  }

  return (
    <Menu className={styles.menu} onSelectionChange={onSelect}>
      {values?.map(({ value }) => {
        return <MenuItem key={value}>{formatValue(value, type)}</MenuItem>;
      })}
    </Menu>
  );
};
