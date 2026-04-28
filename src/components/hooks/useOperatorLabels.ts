import { OPERATORS } from '@/lib/constants';
import { useMessages } from './useMessages';

export function useOperatorLabels(): Record<string, string> {
  const { t, labels } = useMessages();

  return {
    [OPERATORS.equals]: t(labels.is),
    [OPERATORS.notEquals]: t(labels.isNot),
    [OPERATORS.set]: t(labels.isSet),
    [OPERATORS.notSet]: t(labels.isNotSet),
    [OPERATORS.contains]: t(labels.contains),
    [OPERATORS.doesNotContain]: t(labels.doesNotContain),
    [OPERATORS.true]: t(labels.true),
    [OPERATORS.false]: t(labels.false),
    [OPERATORS.greaterThan]: t(labels.greaterThan),
    [OPERATORS.lessThan]: t(labels.lessThan),
    [OPERATORS.greaterThanEquals]: t(labels.greaterThanEquals),
    [OPERATORS.lessThanEquals]: t(labels.lessThanEquals),
    [OPERATORS.before]: t(labels.before),
    [OPERATORS.after]: t(labels.after),
  };
}
