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
        value={[value]}
        onChange={e => {
          const nextValue = e[0];

          if (nextValue) {
            onChange?.(nextValue);
          }
        }}
        disallowEmptySelection={true}
      >
        {items.map(({ id, label }) => (
          <ToggleGroupItem key={id} id={id}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Box>
  );
}
