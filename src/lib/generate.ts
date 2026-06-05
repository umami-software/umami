export function random(min: number, max: number) {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

export function getRandomChars(
  n: number,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
) {
  const arr = chars.split('');
  let s = '';
  for (let i = 0; i < n; i++) {
    s += arr[random(0, arr.length - 1)];
  }
  return s;
}
