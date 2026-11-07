import { Avatar as DiceAvatar, Style } from '@dicebear/core';
import lorelei from '@dicebear/styles/lorelei.json';
import { useMemo } from 'react';
import { getColor, getPastel } from '@/lib/colors';

const style = new Style(lorelei);

export function Avatar({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const backgroundColor = getPastel(getColor(seed), 4);

  const avatar = useMemo(() => {
    return new DiceAvatar(style, {
      ...props,
      seed,
      size,
      backgroundColor: [backgroundColor],
    }).toDataUri();
  }, []);

  return <img src={avatar} alt="Avatar" style={{ borderRadius: '100%', width: size }} />;
}
