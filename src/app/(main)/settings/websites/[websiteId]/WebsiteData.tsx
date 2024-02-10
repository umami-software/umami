import { Button, Modal, ModalTrigger, ActionForm, useToasts } from 'react-basics';
import { useRouter } from 'next/navigation';
import { useMessages, useModified, useTeamUrl } from 'components/hooks';
import WebsiteDeleteForm from './WebsiteDeleteForm';
import WebsiteResetForm from './WebsiteResetForm';
import WebsiteTransferForm from './WebsiteTransferForm';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const router = useRouter();
  const { showToast } = useToasts();
  const { touch } = useModified();
  const { teamId, renderTeamUrl } = useTeamUrl();

  const handleTransfer = () => {
    touch('websites');

    router.push(renderTeamUrl(`/settings/websites`));
  };

  const handleReset = async () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    onSave?.();
  };

  const handleDelete = async () => {
    touch('websites');

    if (teamId) {
      router.push(renderTeamUrl('/settings/websites'));
    } else {
      router.push('/settings/websites');
    }
  };

  return (
    <>
      <ActionForm
        label={formatMessage(labels.transferWebsite)}
        description={formatMessage(messages.transferWebsite)}
      >
        <ModalTrigger>
          <Button variant="secondary">{formatMessage(labels.transfer)}</Button>
          <Modal title={formatMessage(labels.transferWebsite)}>
            {(close: () => void) => (
              <WebsiteTransferForm websiteId={websiteId} onSave={handleTransfer} onClose={close} />
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
          <Button variant="danger">{formatMessage(labels.delete)}</Button>
          <Modal title={formatMessage(labels.deleteWebsite)}>
            {(close: () => void) => (
              <WebsiteDeleteForm websiteId={websiteId} onSave={handleDelete} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
    </>
  );
}

export default WebsiteData;
