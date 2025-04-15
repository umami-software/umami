import { useMessages } from './useMessages';
import { useNavigation } from '@/components/hooks/useNavigation';
import { FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import { safeDecodeURIComponent } from '@/lib/url';

export function useFilters() {
  const { formatMessage, labels } = useMessages();
  const { query } = useNavigation();

  const fields = [
    { name: 'url', type: 'string', label: formatMessage(labels.url) },
    { name: 'title', type: 'string', label: formatMessage(labels.pageTitle) },
    { name: 'referrer', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'query', type: 'string', label: formatMessage(labels.query) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
    { name: 'host', type: 'string', label: formatMessage(labels.host) },
    { name: 'tag', type: 'string', label: formatMessage(labels.tag) },
  ];

  const operators = [
    { name: 'eq', type: 'string', label: 'Is' },
    { name: 'neq', type: 'string', label: 'Is not' },
    { name: 'c', type: 'string', label: 'Contains' },
    { name: 'dnc', type: 'string', label: 'Does not contain' },
    { name: 'c', type: 'array', label: 'Contains' },
    { name: 'dnc', type: 'array', label: 'Does not contain' },
    { name: 't', type: 'boolean', label: 'True' },
    { name: 'f', type: 'boolean', label: 'False' },
    { name: 'eq', type: 'number', label: 'Is' },
    { name: 'neq', type: 'number', label: 'Is not' },
    { name: 'gt', type: 'number', label: 'Greater than' },
    { name: 'lt', type: 'number', label: 'Less than' },
    { name: 'gte', type: 'number', label: 'Greater than or equals' },
    { name: 'lte', type: 'number', label: 'Less than or equals' },
    { name: 'bf', type: 'date', label: 'Before' },
    { name: 'af', type: 'date', label: 'After' },
    { name: 'eq', type: 'uuid', label: 'Is' },
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
