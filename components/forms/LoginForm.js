import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Formik, Form, Field } from 'formik';
import Router from 'next/router';
import { post } from 'lib/web';
import Button from 'components/common/Button';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';
import Icon from 'components/common/Icon';
import Logo from 'assets/logo.svg';
import styles from './LoginForm.module.css';

const validate = ({ username, password }) => {
  const errors = {};

  if (!username) {
    errors.username = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }
  if (!password) {
    errors.password = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }

  return errors;
};

export default function LoginForm() {
  const [message, setMessage] = useState();

  const handleSubmit = async ({ username, password }) => {
    const response = await post('/api/auth/login', { username, password });

    if (typeof response !== 'string') {
      await Router.push('/');
    } else {
      setMessage(
        response.startsWith('401') ? (
          <FormattedMessage
            id="message.incorrect-username-password"
            defaultMessage="Incorrect username/password."
          />
        ) : (
          response
        ),
      );
    }
  };

  return (
    <FormLayout className={styles.login}>
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
            <Icon icon={<Logo />} size="xlarge" className={styles.icon} />
            <h1 className="center">umami</h1>
            <FormRow>
              <label htmlFor="username">
                <FormattedMessage id="label.username" defaultMessage="Username" />
              </label>
              <Field name="username" type="text" />
              <FormError name="username" />
            </FormRow>
            <FormRow>
              <label htmlFor="password">
                <FormattedMessage id="label.password" defaultMessage="Password" />
              </label>
              <Field name="password" type="password" />
              <FormError name="password" />
            </FormRow>
            <FormButtons>
              <Button type="submit" variant="action">
                <FormattedMessage id="button.login" defaultMessage="Login" />
              </Button>
            </FormButtons>
            <FormMessage>{message}</FormMessage>
          </Form>
        )}
      </Formik>
    </FormLayout>
  );
}
