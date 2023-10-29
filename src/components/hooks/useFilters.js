import { useMessages } from './useMessages';
import { OPERATORS } from 'lib/constants';

export function useFilters() {
  const { formatMessage, labels } = useMessages();

  const filterLabels = {
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
    string: [OPERATORS.equals, OPERATORS.notEquals],
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

  const getFilters = type => {
    return typeFilters[type]?.map(key => ({ type, value: key, label: filterLabels[key] })) ?? [];
  };

  return { getFilters, filterLabels, typeFilters };
}

export default useFilters;
