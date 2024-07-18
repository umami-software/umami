import { Button, Modal, ModalTrigger, ActionForm } from 'react-basics';
import { useRouter } from 'next/navigation';
import { useLogin, useMessages, useModified, useTeams, useTeamUrl } from 'components/hooks';
import WebsiteDeleteForm from './WebsiteDeleteForm';
import WebsiteResetForm from './WebsiteResetForm';
import WebsiteTransferForm from './WebsiteTransferForm';
import { ROLES } from 'lib/constants';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useLogin();
  const { touch } = useModified();
  const { teamId, renderTeamUrl } = useTeamUrl();
  const router = useRouter();
  const { result } = useTeams(user.id);
  const hasTeams = result?.data?.length > 0;
  const isTeamOwner =
    (!teamId && hasTeams) ||
    (hasTeams &&
      result?.data
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
    <>
      <ActionForm
        label={formatMessage(labels.transferWebsite)}
        description={formatMessage(messages.transferWebsite)}
      >
        <ModalTrigger disabled={!isTeamOwner}>
          <Button variant="secondary" disabled={!isTeamOwner}>
            {formatMessage(labels.transfer)}
          </Button>
          <Modal title={formatMessage(labels.transferWebsite)}>
            {(close: () => void) => (
              <WebsiteTransferForm websiteId={websiteId} onSave={handleSave} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
      <ActionForm
        label={formatMessage(labels.resetWebsite)}
        description={formatMessage(messages.resetWebsiteWarning)}
      >
        <ModalTrigger>
          <Button variant="secondary">{formatMessage(labels.reset)}</Button>
          <Modal title={formatMessage(labels.resetWebsite)}>
            {(close: () => void) => (
              <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
      <ActionForm
        label={formatMessage(labels.deleteWebsite)}
        description={formatMessage(messages.deleteWebsiteWarning)}
      >
        <ModalTrigger>
          <Button data-test="button-delete" variant="danger">
            {formatMessage(labels.delete)}
          </Button>
          <Modal title={formatMessage(labels.deleteWebsite)}>
            {(close: () => void) => (
              <WebsiteDeleteForm websiteId={websiteId} onSave={handleSave} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
    </>
  );
}

export default WebsiteData;
