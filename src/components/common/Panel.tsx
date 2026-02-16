import {
  Button,
  Column,
  type ColumnProps,
  Heading,
  Icon,
  Row,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import { Maximize, X } from '@/components/icons';

export interface PanelProps extends ColumnProps {
  title?: string;
  description?: string;
  allowFullscreen?: boolean;
}

const fullscreenStyles = {
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  top: 0,
  left: 0,
  border: 'none',
  zIndex: 9999,
} as any;

export function Panel({
  title,
  description,
  allowFullscreen,
  style,
  children,
  height,
  width,
  ...props
}: PanelProps) {
  const { t, labels } = useMessages();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Column
      paddingY="6"
      paddingX={{ base: '3', md: '6' }}
      border
      borderRadius
      backgroundColor="surface-base"
      position="relative"
      gap
      {...props}
      style={{ ...style, ...(isFullscreen ? fullscreenStyles : { height, width }) }}
    >
      {title && <Heading>{title}</Heading>}
      {description && <Text color="muted">{description}</Text>}
      {allowFullscreen && (
        <Row justifyContent="flex-end" alignItems="center">
          <TooltipTrigger delay={0} isDisabled={isFullscreen}>
            <Button size="sm" variant="quiet" onPress={handleFullscreen}>
              <Icon>{isFullscreen ? <X /> : <Maximize />}</Icon>
            </Button>
            <Tooltip>{t(labels.maximize)}</Tooltip>
          </TooltipTrigger>
        </Row>
      )}
      {children}
    </Column>
  );
}
