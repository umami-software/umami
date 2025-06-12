import { ReactNode } from 'react';
import { Row } from '@umami/react-zen';

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
    <Row gap="3" alignItems="center">
      <img
        src={`${process.env.basePath || ''}/images/${type}/${
          value?.replaceAll(' ', '-').toLowerCase() || 'unknown'
        }.png`}
        onError={e => {
          e.currentTarget.src = `${process.env.basePath || ''}/images/${type}/unknown.png`;
        }}
        alt={value}
        width={type === 'country' ? undefined : 16}
        height={type === 'country' ? undefined : 16}
      />
      {children}
    </Row>
  );
}
