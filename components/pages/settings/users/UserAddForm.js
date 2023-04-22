import {
  Dropdown,
  Item,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  TextField,
  PasswordField,
  SubmitButton,
  Button,
} from 'react-basics';
import useApi from 'hooks/useApi';
import { ROLES } from 'lib/constants';
import useMessages from 'hooks/useMessages';

export function UserAddForm({ onSave, onClose }) {
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post(`/users`, data));
  const { formatMessage, labels } = useMessages();

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
        onClose();
      },
    });
  };

  const renderValue = value => {
    if (value === ROLES.user) {
      return formatMessage(labels.user);
    }
    if (value === ROLES.admin) {
      return formatMessage(labels.admin);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormRow label={formatMessage(labels.username)}>
        <FormInput name="username" rules={{ required: formatMessage(labels.required) }}>
          <TextField autoComplete="new-username" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.password)}>
        <FormInput name="password" rules={{ required: formatMessage(labels.required) }}>
          <PasswordField autoComplete="new-password" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.role)}>
        <FormInput name="role" rules={{ required: formatMessage(labels.required) }}>
          <Dropdown renderValue={renderValue}>
            <Item key={ROLES.user}>{formatMessage(labels.user)}</Item>
            <Item key={ROLES.admin}>{formatMessage(labels.admin)}</Item>
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={false}>
          {formatMessage(labels.save)}
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}

export default UserAddForm;
