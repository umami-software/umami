import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
  Row,
} from '@umami/react-zen';
import { Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useMobile, useModified } from '@/components/hooks';
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
            <Button variant="ghost" aria-label={t(labels.edit)} onClick={() => setEditShareId(id)}>
              <Icon>
                <Edit />
              </Icon>
            </Button>
            <Button
              variant="ghost"
              aria-label={t(labels.delete)}
              onClick={() => setDeleteShare({ id, slug })}
            >
              <Icon>
                <Trash />
              </Icon>
            </Button>
          </Row>
        )}
      />
      <Dialog open={!!editShareId} onOpenChange={isOpen => !isOpen && setEditShareId(null)}>
        <DialogContent
          showCloseButton={false}
          style={{
            width: isMobile ? '100%' : '600px',
            height: isMobile ? '100%' : undefined,
            maxWidth: isMobile ? '100%' : 'calc(100% - 2rem)',
            maxHeight: isMobile ? '100%' : 'min(80dvh, calc(100dvh - 40px))',
            borderRadius: isMobile ? 0 : undefined,
            overflowY: 'auto',
          }}
        >
          <DialogHeader>
            <DialogTitle>{t(labels.share)}</DialogTitle>
          </DialogHeader>
          {editShareId && (
            <ShareEditForm shareId={editShareId} onClose={() => setEditShareId(null)} />
          )}
        </DialogContent>
      </Dialog>
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
    <Dialog open={!!share} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        style={{
          width: '400px',
          maxHeight: 'min(80dvh, calc(100dvh - 40px))',
          overflowY: 'auto',
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
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
            buttonVariant="destructive"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
