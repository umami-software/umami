import {
  Button,
  Column,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { ActionForm } from '@/components/common/ActionForm';
import {
  useLoginQuery,
  useMessages,
  useModified,
  useNavigation,
  useUserTeamsQuery,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';
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
  const [showTransfer, setShowTransfer] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
          <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
            <DialogTrigger render={<Button variant="outline" disabled={!canTransferWebsite} />}>
              {t(labels.transfer)}
            </DialogTrigger>
            <DialogContent showCloseButton={false} style={{ width: 400 }}>
              <DialogHeader>
                <DialogTitle>{t(labels.transferWebsite)}</DialogTitle>
              </DialogHeader>
              <WebsiteTransferForm
                websiteId={websiteId}
                onSave={handleSave}
                onClose={() => setShowTransfer(false)}
              />
            </DialogContent>
          </Dialog>
        </ActionForm>
      )}

      <ActionForm label={t(labels.resetWebsite)} description={t(messages.resetWebsiteWarning)}>
        <Dialog open={showReset} onOpenChange={setShowReset}>
          <DialogTrigger render={<Button variant="outline" />}>{t(labels.reset)}</DialogTrigger>
          <DialogContent showCloseButton={false} style={{ width: 400 }}>
            <DialogHeader>
              <DialogTitle>{t(labels.resetWebsite)}</DialogTitle>
            </DialogHeader>
            <WebsiteResetForm
              websiteId={websiteId}
              onSave={handleReset}
              onClose={() => setShowReset(false)}
            />
          </DialogContent>
        </Dialog>
      </ActionForm>

      <ActionForm label={t(labels.deleteWebsite)} description={t(messages.deleteWebsiteWarning)}>
        <Dialog open={showDelete} onOpenChange={setShowDelete}>
          <DialogTrigger render={<Button data-test="button-delete" variant="destructive" />}>
            {t(labels.delete)}
          </DialogTrigger>
          <DialogContent showCloseButton={false} style={{ width: 400 }}>
            <DialogHeader>
              <DialogTitle>{t(labels.deleteWebsite)}</DialogTitle>
            </DialogHeader>
            <WebsiteDeleteForm
              websiteId={websiteId}
              onSave={handleSave}
              onClose={() => setShowDelete(false)}
            />
          </DialogContent>
        </Dialog>
      </ActionForm>
    </Column>
  );
}
