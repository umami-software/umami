import { useState } from 'react';
import { createPortal } from 'react-dom';
import { REPORT_PARAMETERS } from '@/lib/constants';
import PopupForm from './PopupForm';
import FieldSelectForm from './FieldSelectForm';

export function FieldAddForm({
  fields = [],
  group,
  onAdd,
  onClose,
}: {
  fields?: any[];
  group: string;
  onAdd: (group: string, value: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<{
    name: string;
    type: string;
    value: string;
  }>();

  const handleSelect = (value: any) => {
    const { type } = value;

    if (group === REPORT_PARAMETERS.groups || type === 'array' || type === 'boolean') {
      value.value = group === REPORT_PARAMETERS.groups ? '' : 'total';
      handleSave(value);
      return;
    }

    setSelected(value);
  };

  const handleSave = (value: any) => {
    onAdd(group, value);
    onClose();
  };

  return createPortal(
    <PopupForm>
      {!selected && <FieldSelectForm fields={fields} onSelect={handleSelect} />}
    </PopupForm>,
    document.body,
  );
}

export default FieldAddForm;
