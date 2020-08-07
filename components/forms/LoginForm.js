import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import Router from 'next/router';
import { post } from 'lib/web';
import Button from '../interface/Button';
import FormLayout, { FormButtons, FormError, FormMessage, FormRow } from '../layout/FormLayout';
import styles from './LoginForm.module.css';

const validate = ({ username, password }) => {
  const errors = {};

  if (!username) {
    errors.username = 'Required';
  }
  if (!password) {
    errors.password = 'Required';
  }

  return errors;
};

export default function LoginForm() {
  const [message, setMessage] = useState();

  const handleSubmit = async ({ username, password }) => {
    const response = await post('/api/auth/login', { username, password });

    if (response?.token) {
      await Router.push('/');
    } else {
      setMessage('Incorrect username/password.');
    }
  };

  return (
    <FormLayout>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <h1 className={styles.title}>umami</h1>
            <FormRow>
              <label htmlFor="username">Username</label>
              <Field name="username" type="text" />
              <FormError name="username" />
            </FormRow>
            <FormRow>
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" />
              <FormError name="password" />
            </FormRow>
            <FormButtons>
              <Button className={styles.button} type="submit">
                Login
              </Button>
            </FormButtons>
            <FormMessage>{message}</FormMessage>
          </Form>
        )}
      </Formik>
    </FormLayout>
  );
}
