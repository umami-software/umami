const ALIASES: Record<string, string> = {
  'asia/calcutta': 'Asia/Kolkata',
  'utc': 'UTC',
  'gmt': 'UTC',
  'greenwich': 'UTC',
};

export function canonicalizeTimeZone(tz?: string | null): string {
  if (!tz) return 'UTC';
  const key = tz.trim().toLowerCase();
  return ALIASES[key] ?? tz.trim();
}
