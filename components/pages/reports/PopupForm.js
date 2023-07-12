import { createPortal } from 'react-dom';
import { useDocumentClick, useKeyDown } from 'react-basics';
import classNames from 'classnames';
import styles from './PopupForm.module.css';

export function PopupForm({ element, className, children, onClose }) {
  const { right, top } = element.getBoundingClientRect();
  const style = { position: 'absolute', left: right, top };

  useKeyDown('Escape', onClose);

  useDocumentClick(e => {
    if (e.target !== element && !element?.parentElement?.contains(e.target)) {
      onClose();
    }
  });

  const handleClick = e => {
    e.stopPropagation();
  };

  return createPortal(
    <div className={classNames(styles.form, className)} style={style} onClick={handleClick}>
      {children}
    </div>,
    document.body,
  );
}

export default PopupForm;
