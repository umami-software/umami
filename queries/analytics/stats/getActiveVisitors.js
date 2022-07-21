import { rawQuery } from 'lib/queries';
import { subMinutes } from 'date-fns';

export function getActiveVisitors(website_id) {
  const date = subMinutes(new Date(), 5);
  const params = [website_id, date];

  return rawQuery(
    `
    select count(distinct session_id) x
    from pageview
    where website_id=$1
    and created_at >= $2
    `,
    params,
  );
}
