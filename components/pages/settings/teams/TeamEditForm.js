import {
  SubmitButton,
  Form,
  FormInput,
  FormRow,
  FormButtons,
  TextField,
  Button,
  Flexbox,
} from 'react-basics';
import { getRandomChars } from 'next-basics';
import { useRef, useState } from 'react';
import useApi from 'hooks/useApi';

const generateId = () => getRandomChars(16);

export default function TeamEditForm({ teamId, data, onSave }) {
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/teams/${teamId}`, data));
  const ref = useRef(null);
  const [accessCode, setAccessCode] = useState(data.accessCode);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        onSave(data);
      },
    });
  };

  const handleRegenerate = () => {
    const code = generateId();
    ref.current.setValue('accessCode', code, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setAccessCode(code);
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={data}>
      <FormRow label="Team ID">
        <TextField value={teamId} readOnly allowCopy />
      </FormRow>
      <FormRow label="Name">
        <FormInput name="name" rules={{ required: 'Required' }}>
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label="Access code">
        <Flexbox gap={10}>
          <TextField value={accessCode} readOnly allowCopy />
          <Button onClick={handleRegenerate}>Regenerate</Button>
        </Flexbox>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">Save</SubmitButton>
      </FormButtons>
    </Form>
  );
}
