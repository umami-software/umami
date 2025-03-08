import { Key } from 'react';
import { Row, Button, Flexbox } from '@umami/react-zen';

export interface FilterButtonsProps {
  items: any[];
  selectedKey?: Key;
  onSelect: (key: any) => void;
}

export function FilterButtons({ items, selectedKey, onSelect }: FilterButtonsProps) {
  return (
    <Flexbox justifyContent="center">
      <Row>
        {items.map(({ key, label }) => (
          <Button key={key}>{label}</Button>
        ))}
      </Row>
    </Flexbox>
  );
}
