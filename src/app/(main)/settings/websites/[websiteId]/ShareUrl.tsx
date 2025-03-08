import {
  Form,
  FormField,
  FormButtons,
  TextField,
  Button,
  Switch,
  FormSubmitButton,
  Box,
  useToast,
} from '@umami/react-zen';
import { useContext, useState } from 'react';
import { getRandomChars } from '@/lib/crypto';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';

const generateId = () => getRandomChars(16);

export function ShareUrl({ hostUrl, onSave }: { hostUrl?: string; onSave?: () => void }) {
  const website = useContext(WebsiteContext);
  const { domain, shareId } = website;
  const { formatMessage, labels, messages } = useMessages();
  const [id, setId] = useState(shareId);
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post(`/websites/${website.id}`, data),
  });
  const { touch } = useModified();
  const { toast } = useToast();

  const url = `${hostUrl || window?.location.origin || ''}${
    process.env.basePath || ''
  }/share/${id}/${domain}`;

  const handleGenerate = () => {
    setId(generateId());
  };

  const handleSwitch = (checked: boolean) => {
    const data = {
      name: website.name,
      domain: website.domain,
      shareId: checked ? generateId() : null,
    };
    mutate(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch(`website:${website.id}`);
        onSave?.();
      },
    });
    setId(data.shareId);
  };

  const handleSave = () => {
    mutate(
      { name: website.name, domain: website.domain, shareId: id },
      {
        onSuccess: async () => {
          toast(formatMessage(messages.saved));
          touch(`website:${website.id}`);
          onSave?.();
        },
      },
    );
  };

  return (
    <>
      <Box marginBottom="6">
        <Switch defaultSelected={!!id} isSelected={!!id} onChange={handleSwitch}>
          {formatMessage(labels.enableShareUrl)}
        </Switch>
      </Box>
      {id && (
        <Form onSubmit={handleSave} error={error} values={{ id, url }}>
          <FormField label={formatMessage(messages.shareUrl)} name="url">
            <TextField isReadOnly allowCopy />
          </FormField>
          <FormButtons justifyContent="space-between">
            <Button onPress={handleGenerate}>{formatMessage(labels.regenerate)}</Button>
            <FormSubmitButton variant="primary" isDisabled={id === shareId} isLoading={isPending}>
              {formatMessage(labels.save)}
            </FormSubmitButton>
          </FormButtons>
        </Form>
      )}
    </>
  );
}
