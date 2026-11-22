import { Column, FloatingTooltip, Row, StatusLight, Text, TooltipBubble } from '@umami/react-zen';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

export function ChartTooltip({
  title,
  color,
  value,
  touchPosition,
}: {
  title?: string;
  color?: string;
  value?: ReactNode;
  touchPosition?: { x: number; y: number } | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!touchPosition || !ref.current) return;

    const updatePosition = () => {
      if (!ref.current) return;
      const { width, height } = ref.current.getBoundingClientRect();
      const padding = 8;
      setPosition({
        x: Math.max(
          padding,
          Math.min(touchPosition.x - width / 2, window.innerWidth - width - padding),
        ),
        y: Math.max(
          padding,
          Math.min(touchPosition.y - height - 10, window.innerHeight - height - padding),
        ),
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [touchPosition, title, value]);

  const content = (
    <Column
      gap="3"
      padding="4"
      borderRadius="md"
      style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: '5.25px',
        color: 'white',
        gap: '10.5px',
        padding: '14px',
      }}
    >
      {title && (
        <Text size="sm" style={{ fontSize: '12.25px', lineHeight: '17.5px' }}>
          {title}
        </Text>
      )}
      <Row alignItems="center">
        <StatusLight color={color}>
          <Text size="sm" style={{ fontSize: '12.25px', lineHeight: '17.5px' }}>
            {value}
          </Text>
        </StatusLight>
      </Row>
    </Column>
  );

  return (
    <>
      {/* Keep tracking mouse movement during the switch from touch to pointer input. */}
      <FloatingTooltip
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          visibility: touchPosition ? 'hidden' : undefined,
        }}
      >
        {content}
      </FloatingTooltip>
      {touchPosition && (
        <TooltipBubble
          ref={ref}
          role="tooltip"
          className="zen-layer-floating"
          style={{
            position: 'fixed',
            left: position?.x ?? 0,
            top: position?.y ?? 0,
            visibility: position ? 'visible' : 'hidden',
            pointerEvents: 'none',
            backgroundColor: 'transparent',
            padding: 0,
            maxWidth: 'calc(100vw - 16px)',
          }}
        >
          {content}
        </TooltipBubble>
      )}
    </>
  );
}
