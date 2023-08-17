import classNames from 'classnames';
import styles from './PopupForm.module.css';

export function PopupForm({ className, style, children }) {
  return (
    <div className={classNames(styles.form, className)} style={style}>
      {children}
    </div>
  );
}

export default PopupForm;
