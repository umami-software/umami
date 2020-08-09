import React from 'react';
import { useSpring, animated } from 'react-spring';
import classNames from 'classnames';
import { ErrorMessage } from 'formik';
import styles from './FormLayout.module.css';

export default function FormLayout({ className, children }) {
  return <div className={classNames(styles.form, className)}>{children}</div>;
}

export const FormButtons = ({ className, children }) => (
  <div className={classNames(styles.buttons, className)}>{children}</div>
);

export const FormError = ({ name }) => {
  return <ErrorMessage name={name}>{msg => <ErrorTag msg={msg} />}</ErrorMessage>;
};

const ErrorTag = ({ msg }) => {
  const props = useSpring({ opacity: 1, from: { opacity: 0 } });

  return (
    <animated.div className={styles.error} style={props}>
      <div className={styles.msg}>{msg}</div>
    </animated.div>
  );
};

export const FormRow = ({ children }) => <div className={styles.row}>{children}</div>;

export const FormMessage = ({ children }) =>
  children ? <div className={styles.message}>{children}</div> : null;
