const BOT_CITIES = [
  'Council Bluffs',
  'North Richland Hills',
  'Santa Clara',
  'Ashburn',
  'The Dalles',
  'Boardman',
  'Quincy',
];

export function isLikelyBot(session: {
  city?: string;
  firstAt?: string | Date;
  lastAt?: string | Date;
}): boolean {
  const cityMatch =
    session.city && BOT_CITIES.some(botCity => session.city?.toLowerCase() === botCity.toLowerCase());

  const zeroDuration =
    session.firstAt &&
    session.lastAt &&
    new Date(session.firstAt).getTime() === new Date(session.lastAt).getTime();

  return !!(cityMatch && zeroDuration);
}
