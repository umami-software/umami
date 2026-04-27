import { DATA_TYPE, FILTER_COLUMNS, OPERATORS } from '@/lib/constants';
import type { EventPropertyFilter, Filter, Operator, QueryFilters, QueryOptions } from '@/lib/types';

const VALID_OPERATORS: Operator[] = Object.values(OPERATORS);
const VALID_EVENT_DATA_TYPES = Object.values(DATA_TYPE);

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
      const stringValue = String(val);
      const withoutPrefix = key.slice(4); // strip "epf_"
      const propertyName = withoutPrefix.replace(/\d+$/, ''); // strip trailing index digits
      const prefixedDotMatch = stringValue.match(/^(\d+)\.([^.]+)\.(.*)$/);
      const untypedDotMatch = stringValue.match(/^([^.]+)\.(.*)$/);
      const explicitDataType = prefixedDotMatch ? Number(prefixedDotMatch[1]) : undefined;
      const rawOperator = prefixedDotMatch ? prefixedDotMatch[2] : untypedDotMatch?.[1];
      const operator = resolveOperator(rawOperator);

      if (!operator || (explicitDataType !== undefined && !VALID_EVENT_DATA_TYPES.includes(explicitDataType))) {
        return [];
      }

      const value = prefixedDotMatch ? prefixedDotMatch[3] : untypedDotMatch?.[2];

      if (value === undefined) {
        return [];
      }

      return [
        {
          propertyName,
          dataType: explicitDataType ?? DATA_TYPE.string,
          operator,
          value,
        },
      ];
    });
}

export function serializeEventPropertyFilters(filters: EventPropertyFilter[]): Record<string, string> {
  const counts: Record<string, number> = {};
  return Object.fromEntries(
    filters.map(f => {
      const n = counts[f.propertyName] ?? 0;
      counts[f.propertyName] = n + 1;
      return [`epf_${f.propertyName}${n > 0 ? n : ''}`, `${f.dataType}.${f.operator}.${f.value}`];
    }),
  );
}
