import {
  Form,
  FormRow,
  FormButtons,
  Flexbox,
  TextField,
  SubmitButton,
  Button,
  Toggle,
} from 'react-basics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getRandomChars } from 'next-basics';
import useApi from 'hooks/useApi';

const generateId = () => getRandomChars(16);

export default function ShareUrl({ websiteId, data, onSave }) {
  const { name, shareId } = data;
  const [id, setId] = useState(shareId);
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(({ shareId }) =>
    post(`/websites/${websiteId}`, { shareId }),
  );
  const ref = useRef(null);
  const url = useMemo(
    () => `${process.env.analyticsUrl}/share/${id}/${encodeURIComponent(name)}`,
    [id, name],
  );

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

  const handleCheck = checked => {
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
    <Form key={websiteId} ref={ref} onSubmit={handleSubmit} error={error} values={data}>
      <FormRow>
        <Toggle checked={Boolean(id)} onChecked={handleCheck}>
          Enable share URL
        </Toggle>
      </FormRow>
      {id && (
        <>
          <FormRow>
            <p>Your website stats are publically available at the following URL:</p>
            <Flexbox gap={10}>
              <TextField value={url} readOnly allowCopy />
              <Button onClick={handleGenerate}>Regenerate URL</Button>
            </Flexbox>
          </FormRow>
          <FormButtons>
            <SubmitButton variant="primary">Save</SubmitButton>
          </FormButtons>
        </>
      )}
    </Form>
  );
}
