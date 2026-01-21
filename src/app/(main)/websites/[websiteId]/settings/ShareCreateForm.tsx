import {
  Button,
  Checkbox,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Row,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { SHARE_NAV_ITEMS } from './constants';

export interface ShareCreateFormProps {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}

export function ShareCreateForm({ websiteId, onSave, onClose }: ShareCreateFormProps) {
  const { formatMessage, labels } = useMessages();
  const { post } = useApi();
  const { touch } = useModified();
  const [isPending, setIsPending] = useState(false);

  // Build default values - all enabled by default
  const defaultValues: Record<string, boolean> = {};
  SHARE_NAV_ITEMS.forEach(section => {
    section.items.forEach(item => {
      defaultValues[item.id] = true;
    });
  });

  const handleSubmit = async (data: any) => {
    setIsPending(true);
    try {
      const parameters: Record<string, boolean> = {};
      SHARE_NAV_ITEMS.forEach(section => {
        section.items.forEach(item => {
          parameters[item.id] = data[item.id] ?? true;
        });
      });
      await post(`/websites/${websiteId}/shares`, { parameters });
      touch('shares');
      onSave?.();
      onClose?.();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} defaultValues={defaultValues}>
      <Column gap="3">
        {SHARE_NAV_ITEMS.map(section => (
          <Column key={section.section} gap="1">
            <Text size="2" weight="bold">
              {formatMessage((labels as any)[section.section])}
            </Text>
            <Column gap="1">
              {section.items.map(item => (
                <FormField key={item.id} name={item.id}>
                  <Checkbox>
                    <Text size="1">{formatMessage((labels as any)[item.label])}</Text>
                  </Checkbox>
                </FormField>
              ))}
            </Column>
          </Column>
        ))}
        <Row justifyContent="flex-end" paddingTop="3" gap="3">
          {onClose && (
            <Button isDisabled={isPending} onPress={onClose}>
              {formatMessage(labels.cancel)}
            </Button>
          )}
          <FormSubmitButton isDisabled={isPending}>{formatMessage(labels.save)}</FormSubmitButton>
        </Row>
      </Column>
    </Form>
  );
}
