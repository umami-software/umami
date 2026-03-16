import { OPERATORS } from '@/lib/constants';
import { useMessages } from './useMessages';

export function useOperatorLabels(): Record<string, string> {
  const { formatMessage, labels } = useMessages();

  return {
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
}
