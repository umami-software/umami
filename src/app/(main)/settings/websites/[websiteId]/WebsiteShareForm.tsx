import {
  Form,
  FormButtons,
  TextField,
  Button,
  Switch,
  FormSubmitButton,
  Column,
  Icon,
  Grid,
  Label,
  useToast,
  TooltipTrigger,
  Tooltip,
} from '@umami/react-zen';
import { useState } from 'react';
import { getRandomChars } from '@/lib/crypto';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { Refresh } from '@/components/icons';

const generateId = () => getRandomChars(16);

export interface WebsiteShareFormProps {
  websiteId: string;
  shareId: string;
  onSave?: () => void;
  onClose?: () => void;
}

export function WebsiteShareForm({ websiteId, shareId, onSave, onClose }: WebsiteShareFormProps) {
  const { formatMessage, labels, messages } = useMessages();
  const [id, setId] = useState(shareId);
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post(`/websites/${websiteId}`, data),
  });
  const { touch } = useModified();
  const { toast } = useToast();

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
            <Grid columns="1fr auto" gap>
              <TextField value={url} isReadOnly allowCopy />
              <TooltipTrigger>
                <Button onPress={handleGenerate} variant="quiet" size="sm">
                  <Icon>
                    <Refresh />
                  </Icon>
                </Button>
                <Tooltip>{formatMessage(labels.regenerate)}</Tooltip>
              </TooltipTrigger>
            </Grid>
          </Column>
        )}
        <FormButtons>
          <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
          <FormSubmitButton isDisabled={false} isLoading={isPending}>
            {formatMessage(labels.save)}
          </FormSubmitButton>
        </FormButtons>
      </Column>
    </Form>
  );
}
