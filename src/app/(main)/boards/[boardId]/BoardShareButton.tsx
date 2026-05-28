import { Share } from '@/components/icons';
import { useMessages } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import { BoardShareDialog } from './BoardShareDialog';
import { useApp } from '@/store/app';

export function BoardShareButton({ boardId }: { boardId: string }) {
  const { t, labels } = useMessages();
  const dateRangeValue = useApp((state) => state.dateRangeValue);

  return (
    <DialogButton
      icon={<Share />}
      label={t(labels.share)}
      title={null}
      width="900px"
    >
      <BoardShareDialog boardId={boardId} dateRangeValue={dateRangeValue} />
    </DialogButton>
  );
}