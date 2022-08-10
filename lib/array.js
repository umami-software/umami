export function chunk(arr, size) {
  const chunks = [];

  let index = 0;
  while (index < arr.length) {
    chunks.push(arr.slice(index, size + index));
    index += size;
  }

  return chunks;
}

export function sortArrayByMap(arr, map = [], key) {
  if (!arr) return [];
  if (map.length === 0) return arr;

  return map.map(id => arr.find(item => item[key] === id));
}
