import { Share } from '@/components/icons';
import { useMessages } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import { BoardShareDialog } from './BoardShareDialog';

export function BoardShareButton({ boardId }: { boardId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton
      icon={<Share />}
      label={t(labels.share)}
      title={null}
      width="900px"
    >
      <BoardShareDialog boardId={boardId} />
    </DialogButton>
  );
}
