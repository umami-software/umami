import { useState } from 'react';
import { Column, type ColumnProps, Row, Icon, Button } from '@umami/react-zen';
import { Maximize, Close } from '@/components/icons';

export interface PanelProps extends ColumnProps {
  allowFullscreen?: boolean;
}

const fullscreenStyles = {
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 9999,
} as any;

export function Panel({ allowFullscreen, style, children, ...props }: PanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Column
      padding="6"
      border
      borderRadius="3"
      backgroundColor
      position="relative"
      gap
      {...props}
      style={{ ...style, ...(isFullscreen ? fullscreenStyles : {}) }}
    >
      {allowFullscreen && (
        <Row justifyContent="flex-end" alignItems="center">
          <Button variant="quiet" onPress={handleFullscreen}>
            <Icon>{isFullscreen ? <Close /> : <Maximize />}</Icon>
          </Button>
        </Row>
      )}
      {children}
    </Column>
  );
}
