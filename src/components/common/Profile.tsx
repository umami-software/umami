import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import md5 from 'md5';

const lib = lorelei;

function convertToPastel(hexColor: string, pastelFactor: number = 0.5) {
  // Remove the # if present
  hexColor = hexColor.replace(/^#/, '');

  // Convert hex to RGB
  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);

  // Calculate pastel version (mix with white)
  //const pastelFactor = 0.5; // Adjust this value to control pastel intensity

  r = Math.floor((r + 255 * pastelFactor) / (1 + pastelFactor));
  g = Math.floor((g + 255 * pastelFactor) / (1 + pastelFactor));
  b = Math.floor((b + 255 * pastelFactor) / (1 + pastelFactor));

  // Convert back to hex
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function Profile({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const avatar = useMemo(() => {
    return createAvatar(lib, {
      ...props,
      seed,
      size,
      backgroundColor: [convertToPastel(md5(seed).substring(0, 6), 2).replace(/^#/, '')],
    }).toDataUri();
  }, []);

  return <img src={avatar} alt="Avatar" style={{ borderRadius: '100%' }} />;
}

export default Profile;
