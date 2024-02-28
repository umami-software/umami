import md5 from 'md5';
import { colord, extend } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import mixPlugin from 'colord/plugins/mix';

extend([harmoniesPlugin, mixPlugin]);

const harmonies = [
  //'analogous',
  //'complementary',
  'double-split-complementary',
  //'rectangle',
  'split-complementary',
  'tetradic',
  //'triadic',
];

const color = (value: string, invert: boolean = false) => {
  const c = colord(value.startsWith('#') ? value : `#${value}`);

  if (invert && c.isDark()) {
    return c.invert();
  }

  return c;
};

const remix = (hash: string) => {
  const a = hash.substring(0, 6);
  const b = hash.substring(6, 12);
  const c = hash.substring(12, 18);
  const d = hash.substring(18, 24);
  const e = hash.substring(24, 30);
  const f = hash.substring(30, 32);

  const base = [b, c, d, e]
    .reduce((acc, val) => {
      return acc.mix(color(val), 0.05);
    }, color(a))
    .saturate(0.1)
    .toHex();

  const harmony = pick(parseInt(f, 16), harmonies);

  return color(base, true)
    .harmonies(harmony)
    .map(c => c.toHex());
};

const pick = (num: number, arr: any[]) => {
  return arr[num % arr.length];
};

export function Avatar({ value }: { value: string }) {
  const hash = md5(value);
  const colors = remix(hash);

  return (
    <svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`color-${hash}`} gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#color-${hash})`} />
    </svg>
  );
}

export default Avatar;
