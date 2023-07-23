export function buildSql(query: string, parameters: object) {
  const params = { ...parameters };

  const sql = query.replaceAll(/\$[\w_]+/g, name => {
    return name;
  });

  return { sql, params };
}
