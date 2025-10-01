import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { getColor, getPastel } from '@/lib/colors';

const lib = lorelei;

// ✅ Modern UTF-8 safe base64 encoder (no deprecated APIs)
function toBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Server (Node.js)
    return Buffer.from(str, 'utf-8').toString('base64');
  } else {
    // Browser (UTF-8 safe)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }
}

export function Avatar({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const backgroundColor = getPastel(getColor(seed), 4);

  const avatar = useMemo(() => {
    const svg = createAvatar(lib, {
      ...props,
      seed,
      size,
      backgroundColor: [backgroundColor],
    }).toString();

    const base64 = toBase64(svg);
    return `data:image/svg+xml;base64,${base64}`;
  }, [seed, size, backgroundColor, props]);

  return <img src={avatar} alt="Avatar" style={{ borderRadius: '100%', width: size }} />;
}
