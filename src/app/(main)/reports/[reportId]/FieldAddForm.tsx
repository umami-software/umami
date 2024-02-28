import { useState } from 'react';
import { createPortal } from 'react-dom';
import { REPORT_PARAMETERS } from 'lib/constants';
import PopupForm from './PopupForm';
import FieldSelectForm from './FieldSelectForm';
import FieldAggregateForm from './FieldAggregateForm';
import FieldFilterForm from './FieldFilterForm';
import styles from './FieldAddForm.module.css';

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
  const [selected, setSelected] = useState<{ name: string; type: string; value: string }>();

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
    <PopupForm className={styles.popup}>
      {!selected && <FieldSelectForm fields={fields} onSelect={handleSelect} />}
      {selected && group === REPORT_PARAMETERS.fields && (
        <FieldAggregateForm {...selected} onSelect={handleSave} />
      )}
      {selected && group === REPORT_PARAMETERS.filters && (
        <FieldFilterForm {...selected} onSelect={handleSave} />
      )}
    </PopupForm>,
    document.body,
  );
}

export default FieldAddForm;
