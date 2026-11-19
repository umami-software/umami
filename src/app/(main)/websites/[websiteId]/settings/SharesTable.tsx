import {
  Button,
  Dialog,
  Icon,
  Modal,
  Row,
} from '@umami/react-zen';
import { useState } from 'react';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useMobile, useModified } from '@/components/hooks';
import { Edit, Trash } from 'lucide-react';
import { SharedSharesTable } from '@/components/share/SharedSharesTable';
import { ShareEditForm } from './ShareEditForm';

export function SharesTable({ data = [] }: { data?: any[] }) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const [editShareId, setEditShareId] = useState<string | null>(null);
  const [deleteShare, setDeleteShare] = useState<{ id: string; slug: string } | null>(null);

  return (
    <>
      <SharedSharesTable
        data={data}
        renderActions={({ id, slug }) => (
          <Row>
            <Button variant="quiet" aria-label={t(labels.edit)} onPress={() => setEditShareId(id)}>
              <Icon>
                <Edit />
              </Icon>
            </Button>
            <Button
              variant="quiet"
              aria-label={t(labels.delete)}
              onPress={() => setDeleteShare({ id, slug })}
            >
              <Icon>
                <Trash />
              </Icon>
            </Button>
          </Row>
        )}
      />
      <ControlledDialog>
        <Modal isOpen={!!editShareId} onOpenChange={isOpen => !isOpen && setEditShareId(null)}>
          <Dialog
            title={t(labels.share)}
            style={{
              width: isMobile ? '100%' : '600px',
              height: isMobile ? '100%' : undefined,
              maxHeight: isMobile ? '100%' : 'min(80dvh, calc(100dvh - 40px))',
              overflowY: 'auto',
              padding: '32px',
            }}
          >
            {editShareId && (
              <ShareEditForm shareId={editShareId} onClose={() => setEditShareId(null)} />
            )}
          </Dialog>
        </Modal>
      </ControlledDialog>
      {deleteShare && (
        <ShareDeleteDialog
          share={deleteShare}
          onClose={() => setDeleteShare(null)}
          title={t(labels.confirm)}
          deleteLabel={t(labels.delete)}
        />
      )}
    </>
  );
}

function ShareDeleteDialog({
  share,
  onClose,
  title,
  deleteLabel,
}: {
  share: { id: string; slug: string } | null;
  onClose: () => void;
  title: string;
  deleteLabel: string;
}) {
  const { t, messages, getErrorMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/share/id/${share.id}`);
  const { touch } = useModified();

  const handleConfirm = async () => {
    if (!share) {
      return;
    }

    await mutateAsync(null, {
      onSuccess: () => {
        touch('shares');
        onClose();
      },
    });
  };

  return (
    <ControlledDialog>
      <Modal isOpen={!!share} onOpenChange={isOpen => !isOpen && onClose()}>
        <Dialog
          title={title}
          style={{
            width: '400px',
            maxHeight: 'min(80dvh, calc(100dvh - 40px))',
            overflowY: 'auto',
            padding: '32px',
          }}
        >
          {share && (
            <ConfirmationForm
              message={t.rich(messages.confirmRemove, {
                target: share.slug,
                b: chunks => <b>{chunks}</b>,
              })}
              isLoading={isPending}
              error={getErrorMessage(error)}
              onConfirm={handleConfirm}
              onClose={onClose}
              buttonLabel={deleteLabel}
              buttonVariant="danger"
            />
          )}
        </Dialog>
      </Modal>
    </ControlledDialog>
  );
}
