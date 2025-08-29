import { ReactNode } from 'react';

export function TypeIcon({
  type,
  value,
  children,
}: {
  type: 'browser' | 'country' | 'device' | 'os';
  value: string;
  children?: ReactNode;
}) {
  if (value === undefined) {
    value = 'unknown';
  }
  return (
    <>
      <img
        src={`${process.env.basePath || ''}/images/${type}/${value
          ?.replaceAll(' ', '-')
          .toLowerCase()}.png`}
        onError={e => {
          e.currentTarget.src = `${process.env.basePath || ''}/images/${type}/unknown.png`;
        }}
        alt={value}
        width={16}
        height={16}
      />
      {children}
    </>
  );
}

export default TypeIcon;
