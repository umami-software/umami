'use client';

import {
  Button,
  Column,
  Dialog,
  DialogTrigger,
  Heading,
  ListItem,
  Modal,
  Select,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';

import { ActionForm } from '@/components/common/ActionForm';
import {
  useApi,
  useMessages,
  useNavigation,
  useWebsiteGoogleAuthQuery,
  useWebsiteGscPropertiesQuery,
  useWebsiteGscPropertyMutation,
} from '@/components/hooks';
import { WebsiteGoogleDisconnectForm } from './WebsiteGoogleDisconnectForm';

export function WebsiteGoogleSearchConsole({ websiteId }: { websiteId: string }) {
  const { t, labels, messages } = useMessages();
  const { router, query, updateParams } = useNavigation();
  const { data, isLoading, refetch } = useWebsiteGoogleAuthQuery(websiteId);
  const { get } = useApi();
  const [connectError, setConnectError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const { data: properties, isLoading: loadingProperties } = useWebsiteGscPropertiesQuery(
    websiteId,
    !!data?.connected,
  );

  const { mutateAsync: saveProperty, isPending: isSaving } =
    useWebsiteGscPropertyMutation(websiteId);

  const handleConnectGoogle = async () => {
    setConnectError(false);
    if (query.gsc_error) {
      router.replace(updateParams({ gsc_error: undefined }));
    }
    try {
      const { url } = await get(`/auth/google`, { websiteId });
      if (!url) {
        setConnectError(true);
        return;
      }
      window.location.href = url;
    } catch {
      setConnectError(true);
    }
  };

  const handlePropertyChange = async (value: string) => {
    if (value && value !== data?.propertyUrl) {
      setSaveError(false);
      try {
        await saveProperty(value);
        void refetch();
      } catch {
        setSaveError(true);
      }
    }
  };

  const handleDisconnected = () => {
    void refetch();
  };

  if (isLoading) {
    return (
      <Column gap="4">
        <Heading>{t(labels.googleSearchConsole)}</Heading>
      </Column>
    );
  }

  const isConnected = data?.connected;

  return (
    <Column gap="6">
      <Column gap="4">
        <Heading>{t(labels.googleSearchConsole)}</Heading>
        <Text color="muted" size="sm">
          {t(messages.gscDescription)}
        </Text>
      </Column>

      {(query.gsc_error || connectError) && <Text color="red">{t(messages.gscConnectError)}</Text>}

      <ActionForm
        label={t(labels.googleAccount)}
        description={isConnected ? data.email : t(messages.gscAccountDescription)}
      >
        {!isConnected ? (
          <Button variant="primary" onPress={handleConnectGoogle}>
            {t(labels.connectWithGoogle)}
          </Button>
        ) : (
          <DialogTrigger>
            <Button variant="danger">{t(labels.disconnect)}</Button>
            <Modal>
              <Dialog title={t(labels.disconnectGoogleAccount)} style={{ width: 400 }}>
                {({ close }) => (
                  <WebsiteGoogleDisconnectForm
                    websiteId={websiteId}
                    onSave={handleDisconnected}
                    onClose={close}
                  />
                )}
              </Dialog>
            </Modal>
          </DialogTrigger>
        )}
      </ActionForm>

      {!isConnected && (
        <Text color="muted" size="sm">
          {t(messages.gscVerificationNote)}
        </Text>
      )}

      {isConnected && (
        <ActionForm label={t(labels.property)} description={t(messages.gscPropertyInstruction)}>
          <Select
            value={data?.propertyUrl ?? ''}
            onChange={handlePropertyChange}
            placeholder={t(labels.selectGscProperty)}
            isDisabled={loadingProperties || isSaving}
          >
            {(properties ?? []).map(p => (
              <ListItem key={p.siteUrl} id={p.siteUrl}>
                {p.siteUrl}
              </ListItem>
            ))}
          </Select>
          {saveError && <Text color="red">{t(messages.gscSavePropertyError)}</Text>}
        </ActionForm>
      )}
    </Column>
  );
}
