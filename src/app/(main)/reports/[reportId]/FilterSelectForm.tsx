import { useState } from 'react';
import FieldSelectForm from './FieldSelectForm';
import FieldFilterEditForm from './FieldFilterEditForm';

export interface FilterSelectFormProps {
  websiteId?: string;
  fields: any[];
  startDate?: Date;
  endDate?: Date;
  onChange?: (filter: { name: string; type: string; operator: string; value: string }) => void;
  allowFilterSelect?: boolean;
}

export default function FilterSelectForm({
  websiteId,
  fields,
  startDate,
  endDate,
  onChange,
  allowFilterSelect,
}: FilterSelectFormProps) {
  const [field, setField] = useState<{ name: string; label: string; type: string }>();

  if (!field) {
    return <FieldSelectForm fields={fields} onSelect={setField} showType={false} />;
  }

  const { name, label, type } = field;

  return (
    <FieldFilterEditForm
      websiteId={websiteId}
      name={name}
      label={label}
      type={type}
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      allowFilterSelect={allowFilterSelect}
      isNew={true}
    />
  );
}
