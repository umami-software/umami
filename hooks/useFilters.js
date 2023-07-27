import { useMessages } from 'hooks';

export function useFilters() {
  const { formatMessage, labels } = useMessages();

  const filters = {
    eq: formatMessage(labels.equals),
    neq: formatMessage(labels.doesNotEqual),
    c: formatMessage(labels.contains),
    dnc: formatMessage(labels.doesNotContain),
    t: formatMessage(labels.true),
    f: formatMessage(labels.false),
    gt: formatMessage(labels.greaterThan),
    lt: formatMessage(labels.lessThan),
    gte: formatMessage(labels.greaterThanEquals),
    lte: formatMessage(labels.lessThanEquals),
    be: formatMessage(labels.before),
    af: formatMessage(labels.after),
  };

  const types = {
    string: ['eq', 'neq'],
    array: ['c', 'dnc'],
    boolean: ['t', 'f'],
    number: ['eq', 'neq', 'gt', 'lt', 'gte', 'lte'],
    date: ['be', 'af'],
    uuid: ['eq'],
  };

  return { filters, types };
}

export default useFilters;
