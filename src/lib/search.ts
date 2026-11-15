// Backslash is the default LIKE escape character in both Postgres and ClickHouse.
export function escapeLikeValue(value: string) {
  return value.replace(/[\\%_]/g, '\\$&');
}

// Values containing `*` match as a LIKE pattern where every `*` is a wildcard;
// all other characters, including `%` and `_`, match literally.
export function getWildcardMatch(value: string) {
  if (!value.includes('*')) {
    return { operator: '=', value };
  }

  return { operator: 'like', value: escapeLikeValue(value).replaceAll('*', '%') };
}
