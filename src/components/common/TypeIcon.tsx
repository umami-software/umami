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
  if (value === undefined) {
    value = 'unknown';
  }
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
        width={16}
        height={16}
      />
      {children}
    </Row>
  );
}
