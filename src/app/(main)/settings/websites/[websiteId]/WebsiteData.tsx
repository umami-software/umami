import { Button, Modal, DialogTrigger, Dialog, Column } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import {
  useLoginQuery,
  useMessages,
  useModified,
  useTeamsQuery,
  useNavigation,
} from '@/components/hooks';
import { WebsiteDeleteForm } from './WebsiteDeleteForm';
import { WebsiteResetForm } from './WebsiteResetForm';
import { WebsiteTransferForm } from './WebsiteTransferForm';
import { ActionForm } from '@/components/layout/ActionForm';
import { ROLES } from '@/lib/constants';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useLoginQuery();
  const { touch } = useModified();
  const { teamId, renderTeamUrl } = useNavigation();
  const router = useRouter();
  const { result } = useTeamsQuery(user.id);
  const canTransferWebsite =
    (
      !teamId &&
      result.data.filter(({ teamUser }) =>
        teamUser.find(
          ({ role, userId }) =>
            [ROLES.teamOwner, ROLES.teamManager].includes(role) && userId === user.id,
        ),
      )
    ).length > 0 ||
    (teamId &&
      !!result?.data
        ?.find(({ id }) => id === teamId)
        ?.teamUser.find(({ role, userId }) => role === ROLES.teamOwner && userId === user.id));

  const handleSave = () => {
    touch('websites');
    onSave?.();
    router.push(renderTeamUrl(`/settings/websites`));
  };

  const handleReset = async () => {
    onSave?.();
  };

  return (
    <Column gap="6">
      <ActionForm
        label={formatMessage(labels.transferWebsite)}
        description={formatMessage(messages.transferWebsite)}
      >
        <DialogTrigger>
          <Button variant="secondary" isDisabled={!canTransferWebsite}>
            {formatMessage(labels.transfer)}
          </Button>
          <Modal>
            <Dialog title={formatMessage(labels.transferWebsite)}>
              {({ close }) => (
                <WebsiteTransferForm websiteId={websiteId} onSave={handleSave} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>

      <ActionForm
        label={formatMessage(labels.resetWebsite)}
        description={formatMessage(messages.resetWebsiteWarning)}
      >
        <DialogTrigger>
          <Button variant="secondary">{formatMessage(labels.reset)}</Button>
          <Modal>
            <Dialog title={formatMessage(labels.resetWebsite)}>
              {({ close }) => (
                <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>

      <ActionForm
        label={formatMessage(labels.deleteWebsite)}
        description={formatMessage(messages.deleteWebsiteWarning)}
      >
        <DialogTrigger>
          <Button data-test="button-delete" variant="danger">
            {formatMessage(labels.delete)}
          </Button>
          <Modal>
            <Dialog title={formatMessage(labels.deleteWebsite)}>
              {({ close }) => (
                <WebsiteDeleteForm websiteId={websiteId} onSave={handleSave} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>
    </Column>
  );
}
