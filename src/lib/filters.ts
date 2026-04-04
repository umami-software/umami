export const percentFilter = (data: any[]) => {
  if (!Array.isArray(data)) return [];
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y, ...props }) => ({ x, y, z: total ? (y / total) * 100 : 0, ...props }));
};

export const paramFilter = (data: any[]) => {
  const map = data.reduce((obj, { x, y }) => {
    try {
      const searchParams = new URLSearchParams(x);

      for (const [key, value] of searchParams) {
        if (!obj[key]) {
          obj[key] = { [value]: y };
        } else if (!obj[key][value]) {
          obj[key][value] = y;
        } else {
          obj[key][value] += y;
        }
      }
    } catch {
      // Ignore
    }

    return obj;
  }, {});

  return Object.keys(map).flatMap(key =>
    Object.keys(map[key]).map(n => ({ x: `${key}=${n}`, p: key, v: n, y: map[key][n] })),
  );
};
