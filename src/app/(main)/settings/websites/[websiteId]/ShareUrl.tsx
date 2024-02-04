'use client';
import { Website } from '@prisma/client';
import {
  Form,
  FormRow,
  FormButtons,
  Flexbox,
  TextField,
  Button,
  Toggle,
  LoadingButton,
  useToasts,
} from 'react-basics';
import { useState } from 'react';
import { getRandomChars } from 'next-basics';
import { useApi, useMessages } from 'components/hooks';

const generateId = () => getRandomChars(16);

export function ShareUrl({
  website,
  hostUrl,
  onSave,
}: {
  website: Website;
  hostUrl?: string;
  onSave?: () => void;
}) {
  const { domain, shareId } = website;
  const { formatMessage, labels, messages } = useMessages();
  const [id, setId] = useState(shareId);
  const { showToast } = useToasts();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post(`/websites/${website.id}`, data),
  });

  const url = `${hostUrl || process.env.hostUrl || window?.location.origin}${
    process.env.basePath
  }/share/${id}/${encodeURIComponent(domain)}`;

  const handleGenerate = () => {
    setId(generateId());
  };

  const handleCheck = (checked: boolean) => {
    const data = { shareId: checked ? generateId() : null };
    mutate(data, {
      onSuccess: async () => {
        onSave?.();
        showToast({ message: formatMessage(messages.saved), variant: 'success' });
      },
    });
    setId(data.shareId);
  };

  const handleSave = () => {
    mutate(
      { shareId: id },
      {
        onSuccess: async () => {
          showToast({ message: formatMessage(messages.saved), variant: 'success' });
          onSave?.();
        },
      },
    );
  };

  return (
    <>
      <Toggle checked={Boolean(id)} onChecked={handleCheck} style={{ marginBottom: 30 }}>
        {formatMessage(labels.enableShareUrl)}
      </Toggle>
      {id && (
        <Form error={error}>
          <FormRow>
            <p>{formatMessage(messages.shareUrl)}</p>
            <Flexbox gap={10}>
              <TextField value={url} readOnly allowCopy />
              <Button onClick={handleGenerate}>{formatMessage(labels.regenerate)}</Button>
            </Flexbox>
          </FormRow>
          <FormButtons>
            <LoadingButton
              variant="primary"
              disabled={id === shareId}
              isLoading={isPending}
              onClick={handleSave}
            >
              {formatMessage(labels.save)}
            </LoadingButton>
          </FormButtons>
        </Form>
      )}
    </>
  );
}

export default ShareUrl;
