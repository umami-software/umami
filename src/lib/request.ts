import { NextApiRequest } from 'next';
import { getAllowedUnits, getMinimumUnit } from './date';
import { getWebsiteDateRange } from '../queries';
import { FILTER_COLUMNS } from 'lib/constants';

export async function getRequestDateRange(req: NextApiRequest) {
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

export function getRequestFilters(req: NextApiRequest) {
  return Object.keys(FILTER_COLUMNS).reduce((obj, key) => {
    const value = req.query[key];

    if (value !== undefined) {
      obj[key] = value;
    }

    return obj;
  }, {});
}
