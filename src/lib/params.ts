import { FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import { QueryFilters, QueryOptions } from '@/lib/types';

export function parseParameterValue(param: any) {
  if (typeof param === 'string') {
    const [, operator, value] = param.match(/^([a-z]+)\.(.*)/) || [];

    return { operator, value };
  }
  return { operator: OPERATORS.equals, value: param };
}

export function isEqualsOperator(operator: any) {
  return [OPERATORS.equals, OPERATORS.notEquals].includes(operator);
}

export function isSearchOperator(operator: any) {
  return [OPERATORS.contains, OPERATORS.doesNotContain].includes(operator);
}

export function filtersToArray(filters: QueryFilters = {}, options: QueryOptions = {}) {
  return Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === null) {
      return arr;
    }

    if (filter?.name && filter?.value !== undefined) {
      return arr.concat({ ...filter, column: options?.columns?.[key] ?? FILTER_COLUMNS[key] });
    }

    const { operator, value } = parseParameterValue(filter);

    return arr.concat({
      name: key,
      column: options?.columns?.[key] ?? FILTER_COLUMNS[key],
      operator,
      value,
    });
  }, []);
}
