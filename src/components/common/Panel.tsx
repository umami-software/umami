import { Box } from '@umami/react-zen';
import type { BoxProps } from '@umami/react-zen/Box';

export function Panel(props: BoxProps) {
  return (
    <Box
      padding="6"
      border
      borderRadius="3"
      backgroundColor
      shadow="4"
      position="relative"
      {...props}
    />
  );
}
