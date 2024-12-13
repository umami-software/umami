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
        width={type === 'country' ? undefined : 16}
        height={type === 'country' ? undefined : 16}
      />
      {children}
    </>
  );
}

export default TypeIcon;
