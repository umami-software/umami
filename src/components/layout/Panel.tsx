import { Box } from '@umami/react-zen';
import type { BoxProps } from '@umami/react-zen/Box';

export function Panel(props: BoxProps) {
  return (
    <Box
      padding="6"
      borderSize="1"
      borderRadius="3"
      backgroundColor="solid"
      shadow="4"
      {...props}
    />
  );
}
