const EDGE_WILDCARD_REGEX = /^\*|\*$/;
const LIKE_METACHARACTER_REGEX = /[\\%_]/g;

/**
 * True when a filter value uses a leading and/or trailing `*` wildcard.
 * A `*` anywhere else is a literal character.
 */
export function hasWildcard(value: string): boolean {
  return EDGE_WILDCARD_REGEX.test(value);
}

/**
 * Converts a value into a SQL LIKE pattern. A leading and/or trailing `*` becomes `%`;
 * everything in between is escaped so LIKE metacharacters typed by the user (`%`, `_`,
 * `\`) and any interior `*` match literally. Backslash is the default LIKE escape
 * character in both PostgreSQL and ClickHouse.
 */
export function wildcardToLikePattern(value: string): string {
  const prefix = value.startsWith('*');
  const suffix = value.length > 1 && value.endsWith('*');
  const literal = value.slice(prefix ? 1 : 0, suffix ? -1 : undefined);

  return `${prefix ? '%' : ''}${literal.replace(LIKE_METACHARACTER_REGEX, char => `\\${char}`)}${suffix ? '%' : ''}`;
}
