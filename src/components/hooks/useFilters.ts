import { FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import { safeDecodeURIComponent } from '@/lib/url';
import { useFields } from './useFields';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';
import { useOperatorLabels } from './useOperatorLabels';

export function useFilters() {
  const { t, labels } = useMessages();
  const { query } = useNavigation();
  const { fields } = useFields();
  const operatorLabels = useOperatorLabels();

  const operators = [
    { name: 'eq', type: 'string', label: t(labels.is) },
    { name: 'neq', type: 'string', label: t(labels.isNot) },
    { name: 'c', type: 'string', label: t(labels.contains) },
    { name: 'dnc', type: 'string', label: t(labels.doesNotContain) },
    { name: 're', type: 'string', label: t(labels.regexMatch) },
    { name: 'nre', type: 'string', label: t(labels.regexNotMatch) },
    { name: 'i', type: 'array', label: t(labels.includes) },
    { name: 'dni', type: 'array', label: t(labels.doesNotInclude) },
    { name: 't', type: 'boolean', label: t(labels.isTrue) },
    { name: 'f', type: 'boolean', label: t(labels.isFalse) },
    { name: 'eq', type: 'number', label: t(labels.is) },
    { name: 'neq', type: 'number', label: t(labels.isNot) },
    { name: 'gt', type: 'number', label: t(labels.greaterThan) },
    { name: 'lt', type: 'number', label: t(labels.lessThan) },
    { name: 'gte', type: 'number', label: t(labels.greaterThanEquals) },
    { name: 'lte', type: 'number', label: t(labels.lessThanEquals) },
    { name: 'bf', type: 'date', label: t(labels.before) },
    { name: 'af', type: 'date', label: t(labels.after) },
    { name: 'eq', type: 'uuid', label: t(labels.is) },
  ];

  const typeFilters = {
    string: [
      OPERATORS.equals,
      OPERATORS.notEquals,
      OPERATORS.contains,
      OPERATORS.doesNotContain,
      OPERATORS.regex,
      OPERATORS.notRegex,
    ],
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
    const baseName = key.replace(/\d+$/, '');
    if (FILTER_COLUMNS[baseName]) {
      let operator = 'eq';
      let value = safeDecodeURIComponent(query[key]);
      const label = fields.find(({ name }) => name === baseName)?.label;

      const match = value.match(/^([a-z]+)\.(.*)/);

      if (match) {
        operator = match[1];
        value = match[2];
      }

      return arr.concat({
        name: key,
        type: baseName,
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
