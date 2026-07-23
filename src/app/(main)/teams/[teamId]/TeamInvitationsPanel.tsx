'use client';

import {
  Button,
  Column,
  DataColumn,
  DataTable,
  Dialog,
  DialogTrigger,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Heading,
  Label,
  ListItem,
  Modal,
  Row,
  Select,
  Text,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { CopyButton } from '@/components/common/CopyButton';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useApi, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

type TeamInvite = {
  id: string;
  teamId: string;
  issuerId: string;
  role: string;
  expiresAt: string;
  revokedAt: string | null;
  usedAt: string | null;
  usedBy: string | null;
  createdAt: string;
};

type CreatedTeamInvite = TeamInvite & { token: string };
type InviteStatus = 'active' | 'used' | 'expired' | 'revoked';

export function TeamInvitationsPanel({ teamId }: { teamId: string }) {
  const { get, useQuery } = useApi();
  const { t, labels, messages } = useMessages();
  const query = useQuery<{ data: TeamInvite[] }>({
    queryKey: ['team-invitations', teamId],
    queryFn: () => get(`/teams/${teamId}/invites`),
  });

  return (
    <Column gap="4">
      <Row alignItems="center" justifyContent="space-between" wrap="wrap" gap>
        <Heading size="base">{t(labels.invitations)}</Heading>
        <DialogTrigger>
          <Button variant="primary">{t(labels.createInvitation)}</Button>
          <Modal>
            <Dialog
              aria-label={t(labels.createInvitation)}
              title={t(labels.createInvitation)}
              style={{ width: 400, maxWidth: 'calc(100vw - 40px)' }}
            >
              {({ close }) => (
                <CreateInvitationForm
                  teamId={teamId}
                  onCreated={() => query.refetch()}
                  onClose={close}
                />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </Row>

      <LoadingPanel
        data={query.data?.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        minHeight="160px"
        renderEmpty={() => <Empty message={t(messages.noInvitations)} />}
      >
        <InvitationsTable
          data={query.data?.data || []}
          teamId={teamId}
          onRevoked={() => query.refetch()}
        />
      </LoadingPanel>
    </Column>
  );
}

function CreateInvitationForm({
  teamId,
  onCreated,
  onClose,
}: {
  teamId: string;
  onCreated: () => void;
  onClose: () => void;
}) {
  const { post } = useApi();
  const { t, labels, messages, getErrorMessage } = useMessages();
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [error, setError] = useState<string | Error>();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (data: { role: string; expiresInDays: string | number }) => {
    setError(undefined);
    setIsPending(true);

    try {
      const invite: CreatedTeamInvite = await post(`/teams/${teamId}/invites`, {
        role: data.role,
        expiresInDays: Number(data.expiresInDays),
      });
      const link =
        `${window.location.origin}${process.env.basePath || ''}/invite` +
        `#invite=${encodeURIComponent(invite.token)}`;
      setInvitationLink(link);
      onCreated();
    } catch (error) {
      setError(error instanceof Error ? error : t(messages.error));
    } finally {
      setIsPending(false);
    }
  };

  if (invitationLink) {
    return (
      <Column gap="4">
        <Text>{t(messages.invitationLinkOneTime)}</Text>
        <Column gap="2">
          <Label>{t(labels.invitationLink)}</Label>
          <Row alignItems="center" gap>
            <TextField
              value={invitationLink}
              aria-label={t(labels.invitationLink)}
              isReadOnly
              style={{ flex: 1 }}
            />
            <CopyButton value={invitationLink} label={t(labels.copyInvitationLink)} />
          </Row>
        </Column>
        <FormButtons>
          <Button onPress={onClose}>{t(labels.done)}</Button>
        </FormButtons>
      </Column>
    );
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{ role: ROLES.teamMember, expiresInDays: '7' }}
    >
      <FormField name="role" label={t(labels.role)} rules={{ required: t(labels.required) }}>
        <Select aria-label={t(labels.role)}>
          <ListItem id={ROLES.teamMember}>{t(labels.member)}</ListItem>
          <ListItem id={ROLES.teamViewOnly}>{t(labels.viewOnly)}</ListItem>
        </Select>
      </FormField>
      <FormField
        name="expiresInDays"
        label={t(labels.expiresIn)}
        rules={{ required: t(labels.required) }}
      >
        <Select aria-label={t(labels.expiresIn)}>
          <ListItem id="1">{t(labels.oneDay)}</ListItem>
          <ListItem id="7">{t(labels.sevenDays)}</ListItem>
          <ListItem id="30">{t(labels.thirtyDays)}</ListItem>
        </Select>
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={isPending} isLoading={isPending}>
          {t(labels.createInvitation)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}

function InvitationsTable({
  data,
  teamId,
  onRevoked,
}: {
  data: TeamInvite[];
  teamId: string;
  onRevoked: () => Promise<unknown>;
}) {
  const { t, labels } = useMessages();
  const roles: Record<string, string> = {
    [ROLES.teamMember]: t(labels.member),
    [ROLES.teamViewOnly]: t(labels.viewOnly),
  };

  return (
    <DataTable data={data}>
      <DataColumn id="role" label={t(labels.role)}>
        {(invite: TeamInvite) => roles[invite.role] || invite.role}
      </DataColumn>
      <DataColumn id="status" label={t(labels.status)}>
        {(invite: TeamInvite) => t(labels[getInviteStatus(invite)])}
      </DataColumn>
      <DataColumn id="expiresAt" label={t(labels.expires)}>
        {(invite: TeamInvite) => new Date(invite.expiresAt).toLocaleDateString()}
      </DataColumn>
      <DataColumn id="action" align="end">
        {(invite: TeamInvite) =>
          getInviteStatus(invite) === 'active' ? (
            <RevokeInvitationButton teamId={teamId} inviteId={invite.id} onRevoked={onRevoked} />
          ) : null
        }
      </DataColumn>
    </DataTable>
  );
}

function RevokeInvitationButton({
  teamId,
  inviteId,
  onRevoked,
}: {
  teamId: string;
  inviteId: string;
  onRevoked: () => Promise<unknown>;
}) {
  const { del } = useApi();
  const { t, labels, messages } = useMessages();
  const [error, setError] = useState<string | Error>();
  const [isPending, setIsPending] = useState(false);

  return (
    <DialogTrigger>
      <Button variant="quiet">{t(labels.revokeInvitation)}</Button>
      <Modal>
        <Dialog
          aria-label={t(labels.revokeInvitation)}
          title={t(labels.revokeInvitation)}
          style={{ width: 400, maxWidth: 'calc(100vw - 40px)' }}
        >
          {({ close }) => (
            <ConfirmationForm
              message={t(messages.confirmRevokeInvitation)}
              buttonLabel={t(labels.revoke)}
              buttonVariant="danger"
              isLoading={isPending}
              error={error}
              onClose={close}
              onConfirm={async () => {
                setError(undefined);
                setIsPending(true);

                try {
                  await del(`/teams/${teamId}/invites/${inviteId}`);
                  await onRevoked();
                  close();
                } catch (error) {
                  setError(error instanceof Error ? error : t(messages.error));
                } finally {
                  setIsPending(false);
                }
              }}
            />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}

function getInviteStatus(invite: TeamInvite): InviteStatus {
  if (invite.revokedAt) {
    return 'revoked';
  }

  if (invite.usedAt) {
    return 'used';
  }

  if (new Date(invite.expiresAt).getTime() <= Date.now()) {
    return 'expired';
  }

  return 'active';
}
