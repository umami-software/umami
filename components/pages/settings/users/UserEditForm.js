import {
  Dropdown,
  Item,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  TextField,
  SubmitButton,
} from 'react-basics';
import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import { ROLES } from 'lib/constants';

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
  const { post } = useApi();
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
    <Form key={id} ref={ref} onSubmit={handleSubmit} error={error} values={data}>
      <FormRow label="Username">
        <FormInput name="username">
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label="Role">
        <FormInput name="role">
          <Dropdown items={items} style={{ width: 200 }}>
            {({ value, label }) => <Item key={value}>{label}</Item>}
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">Save</SubmitButton>
      </FormButtons>
    </Form>
  );
}
