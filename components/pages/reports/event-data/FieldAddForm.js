import { useState } from 'react';
import { createPortal } from 'react-dom';
import { REPORT_PARAMETERS } from 'lib/constants';
import PopupForm from '../PopupForm';
import FieldSelectForm from '../FieldSelectForm';
import FieldAggregateForm from '../FieldAggregateForm';
import FieldFilterForm from '../FieldFilterForm';
import styles from './FieldAddForm.module.css';

export function FieldAddForm({ fields = [], group, element, onAdd, onClose }) {
  const [selected, setSelected] = useState();

  const handleSelect = value => {
    const { type } = value;

    if (group === REPORT_PARAMETERS.groups || type === 'array' || type === 'boolean') {
      value.value = group === REPORT_PARAMETERS.groups ? '' : 'total';
      handleSave(value);
      return;
    }

    setSelected(value);
  };

  const handleSave = value => {
    onAdd(group, value);
    onClose();
  };

  return createPortal(
    <PopupForm className={styles.popup} element={element} onClose={onClose}>
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
