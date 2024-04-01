import { OPERATOR_PREFIXES, OPERATORS } from 'lib/constants';

export function parseParameterValue(param: string) {
  const [, prefix, value] = param.match(/^(!~|!|~)?(.*)$/);

  const operator =
    Object.keys(OPERATOR_PREFIXES).find(key => OPERATOR_PREFIXES[key] === prefix) ||
    OPERATORS.equals;

  return { operator, value };
}

export function operatorEquals(operator: any) {
  return [OPERATORS.equals, OPERATORS.notEquals].includes(operator);
}
