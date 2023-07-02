import { Form, FormRow, Menu, Item } from 'react-basics';

const options = {
  number: [
    { label: 'SUM', value: 'sum' },
    { label: 'AVERAGE', value: 'average' },
    { label: 'MIN', value: 'min' },
    { label: 'MAX', value: 'max' },
  ],
  date: [
    { label: 'MIN', value: 'min' },
    { label: 'MAX', value: 'max' },
  ],
  string: [
    { label: 'COUNT', value: 'count' },
    { label: 'DISTINCT', value: 'distinct' },
  ],
};

export default function FieldAggregateForm({ name, type, onSelect }) {
  const items = options[type];

  const handleSelect = value => {
    onSelect({ name, value });
  };

  return (
    <Form>
      <FormRow label={name}>
        <Menu onSelect={handleSelect}>
          {items.map(({ label, value }) => {
            return <Item key={value}>{label}</Item>;
          })}
        </Menu>
      </FormRow>
    </Form>
  );
}
