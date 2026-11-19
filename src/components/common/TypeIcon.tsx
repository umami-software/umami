import { Row } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { CircleHelp } from '@/components/icons';

export function TypeIcon({
  type,
  value,
  unknown,
  children,
}: {
  type: 'browser' | 'country' | 'device' | 'os';
  value: string;
  unknown?: boolean;
  children?: ReactNode;
}) {
  const iconValue = type === 'browser' && value === 'browser' ? 'unknown' : value;
  const showUnknown = unknown ?? (!iconValue || iconValue.toLowerCase() === 'unknown');
  const blank = `${process.env.basePath || ''}/images/${type}/unknown.png`;

  return (
    <Row gap="3" alignItems="center">
      {showUnknown ? (
        <CircleHelp size={16} />
      ) : (
        <img
          src={
            iconValue
              ? `${process.env.basePath || ''}/images/${type}/${iconValue.replace(/[ ./]/g, '-').toLowerCase()}.png`
              : blank
          }
          onError={e => {
            e.currentTarget.src = blank;
          }}
          alt={value}
          width={type === 'country' ? undefined : 16}
          height={type === 'country' ? undefined : 16}
        />
      )}
      {children}
    </Row>
  );
}
