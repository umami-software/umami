import { bottts, lorelei } from '@dicebear/collection';
import { createAvatar, type Style } from '@dicebear/core';
import { useMemo } from 'react';
import { getColor, getPastel } from '@/lib/colors';

export function Avatar({
  seed,
  size = 128,
  isBot = false,
}: {
  seed: string;
  size?: number;
  isBot?: boolean;
}) {
  const backgroundColor = getPastel(getColor(seed), 4);
  const style = (isBot ? bottts : lorelei) as Style<object>;

  const avatar = useMemo(() => {
    return createAvatar(style, {
      seed,
      size,
      backgroundColor: [backgroundColor],
    }).toDataUri();
  }, [seed, isBot]);

  return <img src={avatar} alt="Avatar" style={{ borderRadius: '100%', width: size }} />;
}
