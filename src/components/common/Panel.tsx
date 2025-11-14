import { useState } from 'react';
import {
  Column,
  type ColumnProps,
  Row,
  Icon,
  Button,
  TooltipTrigger,
  Tooltip,
  Heading,
} from '@umami/react-zen';
import { Maximize, X } from '@/components/icons';
import { useMessages } from '@/components/hooks';

export interface PanelProps extends ColumnProps {
  title?: string;
  allowFullscreen?: boolean;
}

const fullscreenStyles = {
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  border: 'none',
  zIndex: 9999,
} as any;

export function Panel({ title, allowFullscreen, style, children, ...props }: PanelProps) {
  const { formatMessage, labels } = useMessages();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Column
      paddingY="6"
      paddingX={{ xs: '3', md: '6' }}
      border
      borderRadius="3"
      backgroundColor
      position="relative"
      gap
      {...props}
      style={{ ...style, ...(isFullscreen ? fullscreenStyles : {}) }}
    >
      {title && <Heading>{title}</Heading>}
      {allowFullscreen && (
        <Row justifyContent="flex-end" alignItems="center">
          <TooltipTrigger delay={0} isDisabled={isFullscreen}>
            <Button size="sm" variant="quiet" onPress={handleFullscreen}>
              <Icon>{isFullscreen ? <X /> : <Maximize />}</Icon>
            </Button>
            <Tooltip>{formatMessage(labels.maximize)}</Tooltip>
          </TooltipTrigger>
        </Row>
      )}
      {children}
    </Column>
  );
}
