/**
 * Escape LIKE metacharacters (`\`, `%`, `_`) so they are matched literally
 * instead of being interpreted as SQL wildcards.
 *
 * Backslash is escaped first so it cannot be used to escape the characters
 * that follow it.
 */
export function escapeLikeValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Convert a user-supplied search value into a LIKE pattern.
 *
 * LIKE metacharacters are escaped first (so a literal `%`, `_` or `\` in the
 * input matches itself), and then every user-facing `*` wildcard is translated
 * into the SQL `%` wildcard -- including `*` appearing anywhere in the string,
 * not only at the start or end.
 *
 * The result is safe to bind as a query parameter and to use with a
 * PostgreSQL `LIKE / ILIKE ... ESCAPE '\'` clause or a ClickHouse `LIKE`
 * (ClickHouse treats backslash as the LIKE escape character).
 */
export function toLikePattern(value: string): string {
  return escapeLikeValue(value).replace(/\*/g, '%');
}
