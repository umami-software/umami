import { Form, FormRow, Menu, Item } from 'react-basics';
import { useMessages } from 'hooks';

export default function FieldAggregateForm({ name, type, onSelect }) {
  const { formatMessage, labels } = useMessages();

  const options = {
    number: [
      { label: formatMessage(labels.sum), value: 'sum' },
      { label: formatMessage(labels.average), value: 'average' },
      { label: formatMessage(labels.min), value: 'min' },
      { label: formatMessage(labels.max), value: 'max' },
    ],
    date: [
      { label: formatMessage(labels.min), value: 'min' },
      { label: formatMessage(labels.max), value: 'max' },
    ],
    string: [
      { label: formatMessage(labels.total), value: 'total' },
      { label: formatMessage(labels.unique), value: 'unique' },
    ],
    uuid: [
      { label: formatMessage(labels.total), value: 'total' },
      { label: formatMessage(labels.unique), value: 'unique' },
    ],
  };

  const items = options[type];

  const handleSelect = value => {
    onSelect({ name, type, value });
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
