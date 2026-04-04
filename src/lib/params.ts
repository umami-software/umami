import { FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import type { Filter, QueryFilters, QueryOptions } from '@/lib/types';

export function parseFilterValue(param: any) {
  if (typeof param === 'string') {
    const operatorValues = Object.values(OPERATORS).join('|');

    const regex = new RegExp(`^(${operatorValues})\\.(.*)$`);

    const [, operator, value] = param.match(regex) || [];

    const resolvedOperator = operator || OPERATORS.equals;
    const resolvedValue = value ?? param;

    if (resolvedOperator === OPERATORS.equals || resolvedOperator === OPERATORS.notEquals) {
      return { operator: resolvedOperator, value: resolvedValue.split(',') };
    }

    return { operator: resolvedOperator, value: resolvedValue };
  }

  if (Array.isArray(param)) {
    return { operator: OPERATORS.equals, value: param };
  }

  return { operator: OPERATORS.equals, value: [param] };
}

export function isEqualsOperator(operator: any) {
  return [OPERATORS.equals, OPERATORS.notEquals].includes(operator);
}

export function isSearchOperator(operator: any) {
  return [
    OPERATORS.contains,
    OPERATORS.doesNotContain,
    OPERATORS.regex,
    OPERATORS.notRegex,
  ].includes(operator);
}

export function filtersObjectToArray(filters: QueryFilters, options: QueryOptions = {}): Filter[] {
  if (!filters) {
    return [];
  }

  return Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === null) {
      return arr;
    }

    const baseName = key.replace(/\d+$/, '');
    const paramName = key !== baseName ? key : undefined;

    if (filter?.name && filter?.value !== undefined) {
      return arr.concat({
        ...filter,
        column: options?.columns?.[baseName] ?? FILTER_COLUMNS[baseName],
        paramName: paramName ?? filter.paramName,
      });
    }

    const { operator, value } = parseFilterValue(filter);

    return arr.concat({
      name: baseName,
      paramName,
      column: options?.columns?.[baseName] ?? FILTER_COLUMNS[baseName],
      operator,
      value,
      prefix: options?.prefix,
    });
  }, []);
}

export function filtersArrayToObject(filters: Filter[]) {
  const nameCounts: Record<string, number> = {};
  return filters.reduce((obj, filter: Filter) => {
    const { name, operator, value } = filter;
    const count = nameCounts[name] ?? 0;
    const key = count === 0 ? name : `${name}${count}`;
    nameCounts[name] = count + 1;

    obj[key] = `${operator}.${Array.isArray(value) ? value.join(',') : value}`;

    return obj;
  }, {});
}
