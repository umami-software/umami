import { Copy } from '@/components/icons';
import { useNavigation } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import type { Board } from '@/lib/types';
import { BoardCloneForm } from './BoardCloneForm';

export function BoardCloneButton({
  boardId,
  showLabel = false,
}: {
  boardId: string;
  showLabel?: boolean;
}) {
  const { router, renderUrl } = useNavigation();

  const handleSave = (board: Board) => {
    router.push(renderUrl(`/boards/${board.id}/design`, false));
  };

  return (
    <DialogButton
      icon={<Copy />}
      label={showLabel ? 'Clone' : undefined}
      title="Clone board"
      aria-label="Clone"
      variant={showLabel ? undefined : 'quiet'}
      width="600px"
    >
      {({ close }) => <BoardCloneForm boardId={boardId} onSave={handleSave} onClose={close} />}
    </DialogButton>
  );
}
