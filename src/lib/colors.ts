import md5 from 'md5';

export const pick = (num: number, arr: any[]) => {
  return arr[num % arr.length];
};

export function clamp(num: number, min: number, max: number) {
  return num < min ? min : num > max ? max : num;
}

export function hex2RGB(color: string, min: number = 0, max: number = 255) {
  const c = color.replace(/^#/, '');
  const diff = max - min;

  const normalize = (num: number) => {
    return Math.floor((num / 255) * diff + min);
  };

  const r = normalize(parseInt(c.substring(0, 2), 16));
  const g = normalize(parseInt(c.substring(2, 4), 16));
  const b = normalize(parseInt(c.substring(4, 6), 16));

  return { r, g, b };
}

export function rgb2Hex(r: number, g: number, b: number, prefix = '') {
  return `${prefix}${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

export function getPastel(color: string, factor: number = 0.5, prefix = '') {
  let { r, g, b } = hex2RGB(color);

  r = Math.floor((r + 255 * factor) / (1 + factor));
  g = Math.floor((g + 255 * factor) / (1 + factor));
  b = Math.floor((b + 255 * factor) / (1 + factor));

  return rgb2Hex(r, g, b, prefix);
}

export function getColor(seed: string, min: number = 0, max: number = 255) {
  const color = md5(seed).substring(0, 6);
  const { r, g, b } = hex2RGB(color, min, max);

  return rgb2Hex(r, g, b);
}
