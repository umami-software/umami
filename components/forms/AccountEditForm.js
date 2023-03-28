import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Formik, Form, Field, useFormikContext, useField } from 'formik';
import Button from 'components/common/Button';
import Checkbox from 'components/common/Checkbox';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';
import useApi from 'hooks/useApi';
import useFetch from 'hooks/useFetch';

const initialValues = {
  username: '',
  password: '',
  isViewer: false,
  websiteIds: [],
};

const validate = ({ id, username, password }) => {
  const errors = {};

  if (!username) {
    errors.username = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }
  if (!id && !password) {
    errors.password = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }

  return errors;
};

const WebsiteSelect = props => {
  const { data } = useFetch(`/websites`);
  const [field, meta] = useField(props);
  const {
    values: { websiteIds },
  } = useFormikContext();

  return (
    <>
      {data && data.length > 0 && (
        <div
          style={{
            maxHeight: '20vh',
            overflowY: 'auto',
            padding: '0 1rem',
            margin: '0 20px',
            background: 'var(--gray100)',
            border: '1px solid var(--gray500)',
            borderRadius: '5px',
          }}
        >
          {data.map(item => (
            <div key={`websiteIds-${item.id}`}>
              <Checkbox
                {...field}
                value={item.id.toString()}
                label={item.name}
                valueArray={websiteIds}
              />
            </div>
          ))}
        </div>
      )}
      {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
    </>
  );
};

export default function AccountEditForm({ values, onSave, onClose }) {
  const { post } = useApi();
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const { id } = values;
    const { ok, data } = await post(id ? `/accounts/${id}` : '/accounts', values);

    if (ok) {
      onSave();
    } else {
      setMessage(
        data || <FormattedMessage id="message.failure" defaultMessage="Something went wrong." />,
      );
    }
  };

  return (
    <FormLayout>
      <Formik
        initialValues={{ ...initialValues, ...values }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {values => (
          <Form>
            <FormRow>
              <label htmlFor="username">
                <FormattedMessage id="label.username" defaultMessage="Username" />
              </label>
              <div>
                <Field name="username" type="text" />
                <FormError name="username" />
              </div>
            </FormRow>
            <FormRow>
              <label htmlFor="password">
                <FormattedMessage id="label.password" defaultMessage="Password" />
              </label>
              <div>
                <Field name="password" type="password" />
                <FormError name="password" />
              </div>
            </FormRow>
            {!values.values.isAdmin && (
              <FormRow>
                <label />
                <Field name="isViewer">
                  {({ field }) => (
                    <Checkbox
                      {...field}
                      label={<FormattedMessage id="label.is-viewer" defaultMessage="Viewer" />}
                    />
                  )}
                </Field>
              </FormRow>
            )}
            {values.values.isViewer && <WebsiteSelect name="websiteIds" />}
            <FormButtons>
              <Button type="submit" variant="action">
                <FormattedMessage id="label.save" defaultMessage="Save" />
              </Button>
              <Button onClick={onClose}>
                <FormattedMessage id="label.cancel" defaultMessage="Cancel" />
              </Button>
            </FormButtons>
            <FormMessage>{message}</FormMessage>
          </Form>
        )}
      </Formik>
    </FormLayout>
  );
}
