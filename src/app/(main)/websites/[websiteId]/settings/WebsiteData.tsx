import { Button, Modal, DialogTrigger, Dialog, Column } from '@umami/react-zen';
import {
  useLoginQuery,
  useMessages,
  useModified,
  useUserTeamsQuery,
  useNavigation,
} from '@/components/hooks';
import { WebsiteDeleteForm } from './WebsiteDeleteForm';
import { WebsiteResetForm } from './WebsiteResetForm';
import { WebsiteTransferForm } from './WebsiteTransferForm';
import { ActionForm } from '@/components/common/ActionForm';
import { ROLES } from '@/lib/constants';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useLoginQuery();
  const { touch } = useModified();
  const { router, pathname, teamId, renderUrl } = useNavigation();
  const { data: teams } = useUserTeamsQuery(user.id);
  const isAdmin = pathname.startsWith('/admin');

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
        <ActionForm
          label={formatMessage(labels.transferWebsite)}
          description={formatMessage(messages.transferWebsite)}
        >
          <DialogTrigger>
            <Button isDisabled={!canTransferWebsite}>{formatMessage(labels.transfer)}</Button>
            <Modal>
              <Dialog title={formatMessage(labels.transferWebsite)} style={{ width: 400 }}>
                {({ close }) => (
                  <WebsiteTransferForm websiteId={websiteId} onSave={handleSave} onClose={close} />
                )}
              </Dialog>
            </Modal>
          </DialogTrigger>
        </ActionForm>
      )}

      <ActionForm
        label={formatMessage(labels.resetWebsite)}
        description={formatMessage(messages.resetWebsiteWarning)}
      >
        <DialogTrigger>
          <Button>{formatMessage(labels.reset)}</Button>
          <Modal>
            <Dialog title={formatMessage(labels.resetWebsite)} style={{ width: 400 }}>
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
            <Dialog title={formatMessage(labels.deleteWebsite)} style={{ width: 400 }}>
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
