import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from 'lib/client';
import { getRandomChars, useApi } from 'next-basics';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Form,
  FormButtons,
  FormRow,
  HiddenInput,
  SubmitButton,
  TextField,
  Toggle,
} from 'react-basics';

export default function ShareUrlForm({ websiteId, data, onSave }) {
  const { name, shareId } = data;
  const [id, setId] = useState(shareId);
  const { post } = useApi(getAuthToken());
  const { mutate, error } = useMutation(({ shareId }) =>
    post(`/websites/${websiteId}`, { shareId }),
  );
  const ref = useRef(null);
  const url = useMemo(
    () => `${process.env.analyticsUrl}/share/${id}/${encodeURIComponent(name)}`,
    [id, name],
  );

  const generateId = () => getRandomChars(16);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
        ref.current.reset(data);
      },
    });
  };

  const handleGenerate = () => {
    const id = generateId();
    ref.current.setValue('shareId', id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setId(id);
  };

  const handleChange = checked => {
    const data = { shareId: checked ? generateId() : null };
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
      },
    });
    setId(data.shareId);
  };

  useEffect(() => {
    if (id && id !== shareId) {
      ref.current.setValue('shareId', id);
    }
  }, [id, shareId]);

  return (
    <>
      <Toggle checked={Boolean(id)} onChange={handleChange}>
        Enable share URL
      </Toggle>
      {id && (
        <Form key={websiteId} ref={ref} onSubmit={handleSubmit} error={error} values={data}>
          <FormRow>
            <p>Your website stats are publically available at the following URL:</p>
            <TextField value={url} readOnly allowCopy />
          </FormRow>
          <HiddenInput name="shareId" />
          <FormButtons>
            <SubmitButton variant="primary">Save</SubmitButton>
            <Button onClick={handleGenerate}>Regenerate URL</Button>
          </FormButtons>
        </Form>
      )}
    </>
  );
}
