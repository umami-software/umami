import { Button, Column, Dialog, DialogTrigger, Modal } from '@umami/react-zen';
import { useState } from 'react';
import { ActionForm } from '@/components/common/ActionForm';
import {
  useConfig,
  useLoginQuery,
  useMessages,
  useModified,
  useNavigation,
  useUserTeamsQuery,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { WebsiteClearDataForm } from './WebsiteClearDataForm';
import { WebsiteDeleteForm } from './WebsiteDeleteForm';
import { WebsiteResetForm } from './WebsiteResetForm';
import { WebsiteTransferForm } from './WebsiteTransferForm';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { t, labels, messages } = useMessages();
  const { user } = useLoginQuery();
  const { touch } = useModified();
  const { router, pathname, teamId, renderUrl } = useNavigation();
  const { data: teams } = useUserTeamsQuery(user.id);
  const isAdmin = pathname.startsWith('/admin');
  const config = useConfig();
  const canClearData = !!config?.dataDeletionEnabled;
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isClearBusy, setIsClearBusy] = useState(false);

  const handleClearOpenChange = (open: boolean) => {
    // A running delete must finish or stop before the dialog can close.
    if (!open && isClearBusy) {
      return;
    }
    setIsClearOpen(open);
  };

  const canTransferWebsite =
    (
      (!teamId &&
        teams?.data?.filter(({ members }) =>
          members.find(
            ({ role, userId }) =>
              [ROLES.teamOwner, ROLES.teamManager].includes(role) && userId === user.id,
          ),
        )) ||
      []
    ).length > 0 ||
    (teamId &&
      !!teams?.data
        ?.find(({ id }) => id === teamId)
        ?.members.find(({ role, userId }) => role === ROLES.teamOwner && userId === user.id));

  const handleSave = () => {
    touch('websites');
    onSave?.();
    router.push(renderUrl(`/websites`));
  };

  const handleReset = async () => {
    onSave?.();
  };

  return (
    <Column gap="6">
      {!isAdmin && (
        <ActionForm label={t(labels.transferWebsite)} description={t(messages.transferWebsite)}>
          <DialogTrigger>
            <Button isDisabled={!canTransferWebsite}>{t(labels.transfer)}</Button>
            <Modal>
              <Dialog title={t(labels.transferWebsite)} style={{ width: 400 }}>
                {({ close }) => (
                  <WebsiteTransferForm websiteId={websiteId} onSave={handleSave} onClose={close} />
                )}
              </Dialog>
            </Modal>
          </DialogTrigger>
        </ActionForm>
      )}

      <ActionForm label={t(labels.resetWebsite)} description={t(messages.resetWebsiteWarning)}>
        <DialogTrigger>
          <Button>{t(labels.reset)}</Button>
          <Modal>
            <Dialog title={t(labels.resetWebsite)} style={{ width: 400 }}>
              {({ close }) => (
                <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>

      <ActionForm
        label={t(labels.deleteData)}
        description={t(canClearData ? messages.deleteDataWarning : messages.deleteDataUnavailable)}
      >
        <DialogTrigger isOpen={isClearOpen} onOpenChange={handleClearOpenChange}>
          <Button isDisabled={!canClearData}>{t(labels.deleteData)}</Button>
          <Modal>
            <Dialog title={t(labels.deleteData)} style={{ width: 440, maxWidth: '100%' }}>
              {({ close }) => (
                <WebsiteClearDataForm
                  websiteId={websiteId}
                  onSave={handleReset}
                  onClose={close}
                  onBusyChange={setIsClearBusy}
                />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>

      <ActionForm label={t(labels.deleteWebsite)} description={t(messages.deleteWebsiteWarning)}>
        <DialogTrigger>
          <Button data-test="button-delete" variant="danger">
            {t(labels.delete)}
          </Button>
          <Modal>
            <Dialog title={t(labels.deleteWebsite)} style={{ width: 400 }}>
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
