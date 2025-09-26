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
  IconLabel,
} from '@umami/react-zen';
import { useState } from 'react';
import { getRandomChars } from '@/lib/generate';
import { useMessages, useUpdateQuery, useConfig } from '@/components/hooks';
import { RefreshCcw } from 'lucide-react';

const generateId = () => getRandomChars(16);

export interface WebsiteShareFormProps {
  websiteId: string;
  shareId?: string;
  onSave?: () => void;
  onClose?: () => void;
}

export function WebsiteShareForm({ websiteId, shareId, onSave, onClose }: WebsiteShareFormProps) {
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const [currentId, setCurrentId] = useState(shareId);
  const { mutateAsync, error, touch, toast } = useUpdateQuery(`/websites/${websiteId}`);
  const { cloudMode } = useConfig();

  const getUrl = (shareId: string) => {
    if (cloudMode) {
      return `${process.env.cloudUrl}/share/${shareId}`;
    }

    return `${window?.location.origin}${process.env.basePath || ''}/share/${shareId}`;
  };

  const url = getUrl(currentId);

  const handleGenerate = () => {
    setCurrentId(generateId());
  };

  const handleSwitch = () => {
    setCurrentId(currentId ? null : generateId());
  };

  const handleSave = async () => {
    const data = {
      shareId: currentId,
    };
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch(`website:${websiteId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSave} error={getErrorMessage(error)} values={{ url }}>
      <Column gap>
        <Switch isSelected={!!currentId} onChange={handleSwitch}>
          {formatMessage(labels.enableShareUrl)}
        </Switch>
        {currentId && (
          <Row alignItems="flex-end" gap>
            <Column flexGrow={1}>
              <Label>{formatMessage(labels.shareUrl)}</Label>
              <TextField value={url} isReadOnly allowCopy />
            </Column>
            <Column>
              <Button onPress={handleGenerate}>
                <IconLabel icon={<RefreshCcw />} label={formatMessage(labels.regenerate)} />
              </Button>
            </Column>
          </Row>
        )}
        <FormButtons justifyContent="flex-end">
          <Row alignItems="center" gap>
            {onClose && <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>}
            <FormSubmitButton isDisabled={false}>{formatMessage(labels.save)}</FormSubmitButton>
          </Row>
        </FormButtons>
      </Column>
    </Form>
  );
}
