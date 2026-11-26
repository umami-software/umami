import { Box, ToggleGroup, ToggleGroupItem } from '@umami/react-zen';

export interface FilterButtonsProps {
  items: { id: string; label: string }[];
  value: string;
  onChange?: (value: string) => void;
}

export function FilterButtons({ items, value, onChange }: FilterButtonsProps) {
  return (
    <Box>
      <ToggleGroup
        variant="outline"
        spacing={0}
        value={[value]}
        onValueChange={e => {
          const nextValue = e[0];

          if (nextValue) {
            onChange?.(nextValue);
          }
        }}
      >
        {items.map(({ id, label }) => (
          <ToggleGroupItem key={id} value={id}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Box>
  );
}
