import { Box, Button, Column, Icon, Tooltip, TooltipTrigger } from '@umami/react-zen';
import type { ReactElement } from 'react';
import { Plus, X } from '@/components/icons';

export function BoardColumn({
  id,
  component,
  editing = false,
  onRemove,
  canRemove = true,
}: {
  id: string;
  component?: ReactElement;
  editing?: boolean;
  onRemove?: (id: string) => void;
  canRemove?: boolean;
}) {
  const handleAddComponent = () => {};

  return (
    <Column
      marginTop="3"
      marginLeft="3"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor="surface-sunken"
      position="relative"
    >
      {editing && canRemove && (
        <Box position="absolute" top="10px" right="20px" zIndex={100}>
          <TooltipTrigger delay={0}>
            <Button variant="quiet" onPress={() => onRemove?.(id)}>
              <Icon size="sm">
                <X />
              </Icon>
            </Button>
            <Tooltip>Remove column</Tooltip>
          </TooltipTrigger>
        </Box>
      )}
      {editing && (
        <Button variant="outline" onPress={handleAddComponent}>
          <Icon>
            <Plus />
          </Icon>
        </Button>
      )}
    </Column>
  );
}
