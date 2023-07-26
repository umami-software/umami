import { NextApiRequest } from 'next';
import { getAllowedUnits, getMinimumUnit } from './date';
import { getWebsiteDateRange } from '../queries';

export async function parseDateRangeQuery(req: NextApiRequest) {
  const { id: websiteId, startAt, endAt, unit } = req.query;

  // All-time
  if (+startAt === 0 && +endAt === 1) {
    const { min, max } = await getWebsiteDateRange(websiteId as string);

    return {
      websiteId,
      startDate: min,
      endDate: max,
      unit: getMinimumUnit(min, max),
    };
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);
  const minUnit = getMinimumUnit(startDate, endDate);

  return {
    websiteId,
    startDate,
    endDate,
    unit: getAllowedUnits(startDate, endDate).includes(unit as string) ? unit : minUnit,
  };
}
