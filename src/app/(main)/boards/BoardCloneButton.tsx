import { Copy } from '@/components/icons';
import { useLoginQuery, useNavigation } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import { ROLES } from '@/lib/constants';
import type { Board } from '@/lib/types';
import { BoardCloneForm } from './BoardCloneForm';

export function BoardCloneButton({
  boardId,
  showLabel = false,
}: {
  boardId: string;
  showLabel?: boolean;
}) {
  const { user } = useLoginQuery();
  const { router, renderUrl } = useNavigation();

  const handleSave = (board: Board) => {
    router.push(renderUrl(`/boards/${board.id}/design`, false));
  };

  if (user?.role === ROLES.viewOnly) {
    return null;
  }

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
