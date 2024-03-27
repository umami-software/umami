import { NextApiRequest } from 'next';
import { getAllowedUnits, getMinimumUnit } from './date';
import { getWebsiteDateRange } from '../queries';
import { FILTER_COLUMNS, OPERATORS } from 'lib/constants';

const OPERATOR_SYMBOLS = {
  '!': 'neq',
  '~': 'c',
  '!~': 'dnc',
};

export async function parseDateRangeQuery(req: NextApiRequest) {
  const { websiteId, startAt, endAt, unit } = req.query;

  // All-time
  if (+startAt === 0 && +endAt === 1) {
    const result = await getWebsiteDateRange(websiteId as string);
    const { min, max } = result[0];
    const startDate = new Date(min);
    const endDate = new Date(max);

    return {
      startDate,
      endDate,
      unit: getMinimumUnit(startDate, endDate),
    };
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);
  const minUnit = getMinimumUnit(startDate, endDate);

  return {
    startDate,
    endDate,
    unit: (getAllowedUnits(startDate, endDate).includes(unit as string) ? unit : minUnit) as string,
  };
}

export function getQueryFilters(req: NextApiRequest) {
  return Object.keys(FILTER_COLUMNS).reduce((obj, key) => {
    const value = req.query[key];

    if (value) {
      obj[key] = value;
    }

    if (typeof value === 'string') {
      const [, prefix, paramValue] = value.match(/^(!~|!|~)?(.*)$/);

      if (prefix && paramValue) {
        obj[key] = {
          name: key,
          column: FILTER_COLUMNS[key],
          operator: OPERATOR_SYMBOLS[prefix] || OPERATORS.equals,
          value: paramValue,
        };
      }
    }

    return obj;
  }, {});
}
