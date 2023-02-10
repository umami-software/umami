import { ButtonGroup, Button, Flexbox } from 'react-basics';

export default function FilterButtons({ items, selected, onSelect }) {
  return (
    <Flexbox justifyContent="center">
      <ButtonGroup items={items} selectedKey={selected} onSelect={onSelect}>
        {({ key, label }) => <Button key={key}>{label}</Button>}
      </ButtonGroup>
    </Flexbox>
  );
}
