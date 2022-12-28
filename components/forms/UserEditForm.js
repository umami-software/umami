import {
  Dropdown,
  Item,
  Form,
  FormButtons,
  FormInput,
  TextField,
  SubmitButton,
} from 'react-basics';
import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import { getClientAuthToken } from 'lib/client';
import { ROLES } from 'lib/constants';
import styles from './UserForm.module.css';

const items = [
  {
    value: ROLES.user,
    label: 'User',
  },
  {
    value: ROLES.admin,
    label: 'Admin',
  },
];

export default function UserEditForm({ data, onSave }) {
  const { id } = data;
  const { post } = useApi(getClientAuthToken());
  const { mutate, error } = useMutation(({ username }) => post(`/user/${id}`, { username }));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
        ref.current.reset(data);
      },
    });
  };

  return (
    <Form
      key={id}
      className={styles.form}
      ref={ref}
      onSubmit={handleSubmit}
      error={error}
      values={data}
    >
      <FormInput name="username" label="Username">
        <TextField />
      </FormInput>
      <FormInput name="role" label="Role">
        <Dropdown items={items} style={{ width: 200 }}>
          {({ value, label }) => <Item key={value}>{label}</Item>}
        </Dropdown>
      </FormInput>
      <FormButtons>
        <SubmitButton variant="primary">Save</SubmitButton>
      </FormButtons>
    </Form>
  );
}
