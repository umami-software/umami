import { FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import type { EventPropertyFilter, Filter, Operator, QueryFilters, QueryOptions } from '@/lib/types';

const VALID_OPERATORS: Operator[] = Object.values(OPERATORS);
const NUMERIC_EVENT_PROPERTY_OPERATORS: Operator[] = [
  OPERATORS.greaterThan,
  OPERATORS.lessThan,
  OPERATORS.greaterThanEquals,
  OPERATORS.lessThanEquals,
];
const EQUALITY_OPERATORS: Operator[] = [OPERATORS.equals, OPERATORS.notEquals];

function resolveOperator(value?: string): Operator | undefined {
  if (!value) {
    return undefined;
  }

  return VALID_OPERATORS.find(operator => operator === value);
}

export function parseFilterValue(param: any) {
  if (typeof param === 'string') {
    const operatorValues = Object.values(OPERATORS).join('|');

    const regex = new RegExp(`^(${operatorValues})\\.(.*)$`);

    const [, operator, value] = param.match(regex) || [];

    const resolvedOperator = resolveOperator(operator) ?? OPERATORS.equals;
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

export function parseEventPropertyFilters(query: Record<string, any>): EventPropertyFilter[] {
  return Object.entries(query)
    .filter(([key]) => /^epf_/.test(key))
    .flatMap(([key, val]) => {
      const dotIndex = (val as string).indexOf('.');
      if (dotIndex < 1) return [];
      const withoutPrefix = key.slice(4); // strip "epf_"
      const propertyName = withoutPrefix.replace(/\d+$/, ''); // strip trailing index digits
      const rawOperator = (val as string).slice(0, dotIndex);
      const operator = resolveOperator(rawOperator);
      if (!operator) {
        return [];
      }
      const value = (val as string).slice(dotIndex + 1);
      const isNumeric =
        NUMERIC_EVENT_PROPERTY_OPERATORS.includes(operator) ||
        (EQUALITY_OPERATORS.includes(operator) &&
          value !== '' &&
          !Number.isNaN(Number(value)));
      return [{ propertyName, dataType: isNumeric ? 2 : 1, operator, value }];
    });
}

export function serializeEventPropertyFilters(filters: EventPropertyFilter[]): Record<string, string> {
  const counts: Record<string, number> = {};
  return Object.fromEntries(
    filters.map(f => {
      const n = counts[f.propertyName] ?? 0;
      counts[f.propertyName] = n + 1;
      return [`epf_${f.propertyName}${n > 0 ? n : ''}`, `${f.operator}.${f.value}`];
    }),
  );
}
