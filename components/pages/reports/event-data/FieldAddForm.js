import { useState } from 'react';
import { createPortal } from 'react-dom';
import PopupForm from '../PopupForm';
import FieldSelectForm from '../FieldSelectForm';
import FieldAggregateForm from '../FieldAggregateForm';
import FieldFilterForm from '../FieldFilterForm';
import styles from './FieldAddForm.module.css';

export function FieldAddForm({ fields = [], type, element, onAdd, onClose }) {
  const [selected, setSelected] = useState();

  const handleSelect = value => {
    if (type === 'groups') {
      handleSave(value);
      return;
    }

    setSelected(value);
  };

  const handleSave = value => {
    onAdd(type, value);
    onClose();
  };

  return createPortal(
    <PopupForm className={styles.popup} element={element} onClose={onClose}>
      {!selected && <FieldSelectForm fields={fields} type={type} onSelect={handleSelect} />}
      {selected && type === 'fields' && <FieldAggregateForm {...selected} onSelect={handleSave} />}
      {selected && type === 'filters' && <FieldFilterForm {...selected} onSelect={handleSave} />}
    </PopupForm>,
    document.body,
  );
}

export default FieldAddForm;
