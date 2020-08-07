import React from 'react';
import classNames from 'classnames';
import { ErrorMessage } from 'formik';
import styles from './FormLayout.module.css';

export default function FormLayout({ className, children }) {
  return <div className={classNames(styles.form, className)}>{children}</div>;
}

export const FormButtons = ({ className, children }) => (
  <div className={classNames(styles.buttons, className)}>{children}</div>
);

export const FormError = ({ name }) => (
  <ErrorMessage name={name}>{msg => <div className={styles.error}>{msg}</div>}</ErrorMessage>
);

export const FormRow = ({ children }) => <div className={styles.row}>{children}</div>;

export const FormMessage = ({ children }) => <div className={styles.message}>{children}</div>;
