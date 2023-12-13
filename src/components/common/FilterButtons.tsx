import { Key } from 'react';
import { ButtonGroup, Button, Flexbox } from 'react-basics';

export interface FilterButtonsProps {
  items: any[];
  selectedKey?: Key;
  onSelect: (key: any) => void;
}

export function FilterButtons({ items, selectedKey, onSelect }: FilterButtonsProps) {
  return (
    <Flexbox justifyContent="center">
      <ButtonGroup items={items} selectedKey={selectedKey as any} onSelect={onSelect}>
        {({ key, label }) => <Button key={key}>{label}</Button>}
      </ButtonGroup>
    </Flexbox>
  );
}

export default FilterButtons;
