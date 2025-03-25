import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { getColor, getPastel } from '@/lib/colors';

const lib = lorelei;

export function Avatar({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const backgroundColor = getPastel(getColor(seed), 4);

  const avatar = useMemo(() => {
    return createAvatar(lib, {
      ...props,
      seed,
      size,
      backgroundColor: [backgroundColor],
    }).toDataUri();
  }, []);

  return <img src={avatar} alt="Avatar" style={{ borderRadius: '100%', width: size }} />;
}
