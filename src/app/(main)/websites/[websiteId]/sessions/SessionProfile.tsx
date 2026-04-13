'use client';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { Avatar } from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDeleteQuery, useMessages, useWebsiteSessionQuery } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import {
  Button,
  Column,
  Icon,
  Row,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
} from '@umami/react-zen';
import { X } from 'lucide-react';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionInfo } from './SessionInfo';
import { SessionReplaysDataTable } from './SessionReplaysDataTable';
import { SessionStats } from './SessionStats';

export function SessionProfile({
  websiteId,
  sessionId,
  showReplays = true,
  allowDelete = true,
  onClose,
  onDelete,
}: {
  websiteId: string;
  sessionId: string;
  showReplays?: boolean;
  allowDelete?: boolean;
  onClose?: () => void;
  onDelete?: () => void;
}) {
  const { data, isLoading, error } = useWebsiteSessionQuery(websiteId, sessionId);
  const { t, labels, messages } = useMessages();
  const { mutateAsync, isPending, error: deleteError, touch } = useDeleteQuery(
    `/websites/${websiteId}/sessions/${sessionId}`,
  );

  const handleDelete = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('sessions');
        close();
        onDelete?.();
        onClose?.();
      },
    });
  };

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      loadingPlacement="absolute"
    >
      {data && (
        <Column gap>
          <Row justifyContent="flex-end" gap>
            {allowDelete && (
              <DialogButton
                icon={<Trash />}
                variant="quiet"
                title={t(labels.confirm)}
                width="400px"
              >
                {({ close }) => (
                  <ConfirmationForm
                    message={t(messages.confirmDelete, { target: t(labels.session) })}
                    isLoading={isPending}
                    error={deleteError}
                    onConfirm={handleDelete.bind(null, close)}
                    onClose={close}
                    buttonLabel={t(labels.delete)}
                    buttonVariant="danger"
                  />
                )}
              </DialogButton>
            )}
            {onClose && (
              <Button onPress={onClose} variant="quiet">
                <Icon>
                  <X />
                </Icon>
              </Button>
            )}
          </Row>
          <Column gap="6">
            <Row justifyContent="center" alignItems="center" gap="6">
              <Avatar seed={data?.id} size={128} />
              <Column width="360px">
                <TextField label="ID" value={data?.id} allowCopy />
              </Column>
            </Row>
            <SessionStats data={data} />
            <SessionInfo data={data} />

            <Tabs>
              <TabList>
                <Tab id="activity">{t(labels.activity)}</Tab>
                <Tab id="properties">{t(labels.properties)}</Tab>
                {showReplays && <Tab id="replays">{t(labels.replays)}</Tab>}
              </TabList>
              <TabPanel id="activity">
                <SessionActivity
                  websiteId={websiteId}
                  sessionId={sessionId}
                  startDate={data?.firstAt}
                  endDate={data?.lastAt}
                />
              </TabPanel>
              <TabPanel id="properties">
                <SessionData sessionId={sessionId} websiteId={websiteId} />
              </TabPanel>
              {showReplays && (
                <TabPanel id="replays">
                  <SessionReplaysDataTable websiteId={websiteId} sessionId={sessionId} />
                </TabPanel>
              )}
            </Tabs>
          </Column>
        </Column>
      )}
    </LoadingPanel>
  );
}
