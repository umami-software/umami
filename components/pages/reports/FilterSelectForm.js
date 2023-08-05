import { useState } from 'react';
import FieldSelectForm from './FieldSelectForm';
import FieldFilterForm from './FieldFilterForm';

export default function FilterSelectForm({ fields, onSelect }) {
  const [field, setField] = useState();

  if (!field) {
    return <FieldSelectForm fields={fields} onSelect={setField} />;
  }

  return <FieldFilterForm name={field.name} type={field.type} onSelect={onSelect} />;
}
