import { FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import { safeDecodeURIComponent } from '@/lib/url';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';
import { useFields } from './useFields';

export function useFilters() {
  const { formatMessage, labels } = useMessages();
  const { query } = useNavigation();
  const { fields } = useFields();

  const operators = [
    { name: 'eq', type: 'string', label: formatMessage(labels.is) },
    { name: 'neq', type: 'string', label: formatMessage(labels.isNot) },
    { name: 'c', type: 'string', label: formatMessage(labels.contains) },
    { name: 'dnc', type: 'string', label: formatMessage(labels.doesNotContain) },
    { name: 'i', type: 'array', label: formatMessage(labels.includes) },
    { name: 'dni', type: 'array', label: formatMessage(labels.doesNotInclude) },
    { name: 't', type: 'boolean', label: formatMessage(labels.isTrue) },
    { name: 'f', type: 'boolean', label: formatMessage(labels.isFalse) },
    { name: 'eq', type: 'number', label: formatMessage(labels.is) },
    { name: 'neq', type: 'number', label: formatMessage(labels.isNot) },
    { name: 'gt', type: 'number', label: formatMessage(labels.greaterThan) },
    { name: 'lt', type: 'number', label: formatMessage(labels.lessThan) },
    { name: 'gte', type: 'number', label: formatMessage(labels.greaterThanEquals) },
    { name: 'lte', type: 'number', label: formatMessage(labels.lessThanEquals) },
    { name: 'bf', type: 'date', label: formatMessage(labels.before) },
    { name: 'af', type: 'date', label: formatMessage(labels.after) },
    { name: 'eq', type: 'uuid', label: formatMessage(labels.is) },
  ];

  const operatorLabels = {
    [OPERATORS.equals]: formatMessage(labels.is),
    [OPERATORS.notEquals]: formatMessage(labels.isNot),
    [OPERATORS.set]: formatMessage(labels.isSet),
    [OPERATORS.notSet]: formatMessage(labels.isNotSet),
    [OPERATORS.contains]: formatMessage(labels.contains),
    [OPERATORS.doesNotContain]: formatMessage(labels.doesNotContain),
    [OPERATORS.true]: formatMessage(labels.true),
    [OPERATORS.false]: formatMessage(labels.false),
    [OPERATORS.greaterThan]: formatMessage(labels.greaterThan),
    [OPERATORS.lessThan]: formatMessage(labels.lessThan),
    [OPERATORS.greaterThanEquals]: formatMessage(labels.greaterThanEquals),
    [OPERATORS.lessThanEquals]: formatMessage(labels.lessThanEquals),
    [OPERATORS.before]: formatMessage(labels.before),
    [OPERATORS.after]: formatMessage(labels.after),
  };

  const typeFilters = {
    string: [OPERATORS.equals, OPERATORS.notEquals, OPERATORS.contains, OPERATORS.doesNotContain],
    array: [OPERATORS.contains, OPERATORS.doesNotContain],
    boolean: [OPERATORS.true, OPERATORS.false],
    number: [
      OPERATORS.equals,
      OPERATORS.notEquals,
      OPERATORS.greaterThan,
      OPERATORS.lessThan,
      OPERATORS.greaterThanEquals,
      OPERATORS.lessThanEquals,
    ],
    date: [OPERATORS.before, OPERATORS.after],
    uuid: [OPERATORS.equals],
  };

  const filters = Object.keys(query).reduce((arr, key) => {
    if (FILTER_COLUMNS[key]) {
      let operator = 'eq';
      let value = safeDecodeURIComponent(query[key]);
      const label = fields.find(({ name }) => name === key)?.label;

      const match = value.match(/^([a-z]+)\.(.*)/);

      if (match) {
        operator = match[1];
        value = match[2];
      }

      return arr.concat({
        name: key,
        operator,
        value,
        label,
      });
    }
    return arr;
  }, []);

  const getFilters = (type: string) => {
    return (
      typeFilters[type]?.map((key: string | number) => ({
        type,
        value: key,
        label: operatorLabels[key],
      })) ?? []
    );
  };

  return { fields, operators, filters, operatorLabels, typeFilters, getFilters };
}
