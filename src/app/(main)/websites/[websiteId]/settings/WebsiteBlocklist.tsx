import { Button, Column, Label, Row, Text, TextField } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useUpdateQuery, useWebsite } from '@/components/hooks';

export function WebsiteBlocklist({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { t, labels, messages } = useMessages();
  const { mutateAsync, touch, toast, isPending } = useUpdateQuery(`/websites/${websiteId}`);
  const [blockedIps, setBlockedIps] = useState(website?.blockedIps || '');

  const handleSave = async () => {
    await mutateAsync(
      { blockedIps: blockedIps || null },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('websites');
          touch(`website:${websiteId}`);
        },
      },
    );
  };

  return (
    <Column gap="4">
      <Label>{t(labels.blockedIps)}</Label>
      <Text color="muted">{t(messages.blockedIpsDescription)}</Text>
      <TextField
        value={blockedIps}
        onChange={setBlockedIps}
        asTextArea
        resize="none"
        style={{ maxWidth: '500px' }}
      />
      <Row>
        <Button variant="primary" onPress={handleSave} isDisabled={isPending}>
          {t(labels.save)}
        </Button>
      </Row>
    </Column>
  );
}
