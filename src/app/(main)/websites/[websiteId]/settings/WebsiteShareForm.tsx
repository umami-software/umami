import {
  Form,
  FormButtons,
  TextField,
  Button,
  Switch,
  FormSubmitButton,
  Column,
  Label,
  Row,
} from '@umami/react-zen';
import { useState } from 'react';
import { getRandomChars } from '@/lib/crypto';
import { useMessages, useUpdateQuery } from '@/components/hooks';

const generateId = () => getRandomChars(16);

export interface WebsiteShareFormProps {
  websiteId: string;
  shareId?: string;
  onSave?: () => void;
  onClose?: () => void;
}

export function WebsiteShareForm({ websiteId, shareId, onSave, onClose }: WebsiteShareFormProps) {
  const { formatMessage, labels, messages } = useMessages();
  const [id, setId] = useState(shareId);
  const { mutate, error, isPending, touch, toast } = useUpdateQuery(`/websites/${websiteId}`);

  const url = `${window?.location.origin || ''}${process.env.basePath || ''}/share/${id}`;

  const handleGenerate = () => {
    setId(generateId());
  };

  const handleSwitch = () => {
    setId(id ? null : generateId());
  };

  const handleSave = () => {
    const data = {
      shareId: id,
    };
    mutate(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch(`website:${websiteId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSave} error={error} values={{ url }}>
      <Column gap>
        <Switch isSelected={!!id} onChange={handleSwitch}>
          {formatMessage(labels.enableShareUrl)}
        </Switch>
        {id && (
          <Column>
            <Label>{formatMessage(labels.shareUrl)}</Label>
            <TextField value={url} isReadOnly allowCopy />
          </Column>
        )}
        <FormButtons justifyContent="space-between">
          <Row>
            {id && <Button onPress={handleGenerate}>{formatMessage(labels.regenerate)}</Button>}
          </Row>
          <Row alignItems="center" gap>
            {onClose && <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>}
            <FormSubmitButton isDisabled={false} isLoading={isPending}>
              {formatMessage(labels.save)}
            </FormSubmitButton>
          </Row>
        </FormButtons>
      </Column>
    </Form>
  );
}
