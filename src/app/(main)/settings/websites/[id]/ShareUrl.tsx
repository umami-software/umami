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
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getRandomChars } from 'next-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import SettingsContext from '../../SettingsContext';

const generateId = () => getRandomChars(16);

export function ShareUrl({ websiteId, data, onSave }) {
  const ref = useRef(null);
  const { shareUrl, websitesUrl } = useContext(SettingsContext);
  const { formatMessage, labels, messages } = useMessages();
  const { name, shareId } = data;
  const [id, setId] = useState(shareId);
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`${websitesUrl}/${websiteId}`, data),
  });
  const url = useMemo(
    () => `${shareUrl}${process.env.basePath}/share/${id}/${encodeURIComponent(name)}`,
    [id, name],
  );

  const handleSubmit = async (data: any) => {
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

  const handleCheck = (checked: boolean) => {
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
      <Toggle checked={Boolean(id)} onChecked={handleCheck} style={{ marginBottom: 30 }}>
        {formatMessage(labels.enableShareUrl)}
      </Toggle>
      {id && (
        <Form key={websiteId} ref={ref} onSubmit={handleSubmit} error={error} values={data}>
          <FormRow>
            <p>{formatMessage(messages.shareUrl)}</p>
            <Flexbox gap={10}>
              <TextField value={url} readOnly allowCopy />
              <Button onClick={handleGenerate}>{formatMessage(labels.regenerate)}</Button>
            </Flexbox>
          </FormRow>
          <FormButtons>
            <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
          </FormButtons>
        </Form>
      )}
    </>
  );
}

export default ShareUrl;
