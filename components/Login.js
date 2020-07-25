import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Router from 'next/router';
import { post } from 'lib/web';

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

export default function Login() {
  const [message, setMessage] = useState();

  const handleSubmit = async ({ username, password }) => {
    const response = await post('/api/auth', { username, password });

    if (response?.token) {
      await Router.push('/');
    } else {
      setMessage('Incorrect username/password.');
    }
  };

  return (
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
          <h3>{message}</h3>
          <div>
            <label htmlFor="username">Username</label>
            <Field name="username" type="text" />
            <ErrorMessage name="username" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <Field name="password" type="password" />
            <ErrorMessage name="password" />
          </div>
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
