import classNames from 'classnames';
import styles from './PopupForm.module.css';

export function PopupForm({ className, style, children }) {
  return (
    <div
      className={classNames(styles.form, className)}
      style={style}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export default PopupForm;
