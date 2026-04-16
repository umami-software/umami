import { Row } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageHeader } from '@/components/common/PageHeader';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';
import { getBoardEntity } from '@/lib/boards';
import { Edit, LayoutDashboard } from '@/components/icons';
import { BoardEntityBadge } from '../BoardEntityBadge';
import { useBoardEntityBadgeProps } from '../useBoardEntityBadgeProps';

export function BoardViewHeader({
  showActions = true,
  showEntityBadge = true,
}: {
  showActions?: boolean;
  showEntityBadge?: boolean;
}) {
  const { board } = useBoard();
  const { renderUrl } = useNavigation();
  const { t, labels } = useMessages();
  const { entityType, entityId } = getBoardEntity(board);
  const entityBadge = useBoardEntityBadgeProps(entityType, entityId, showEntityBadge);

  return (
    <PageHeader title={board?.name} description={board?.description}>
      <Row alignItems="center" gap>
        {showEntityBadge && entityBadge && <BoardEntityBadge {...entityBadge} />}
        {showActions && board?.id && (
          <>
            <LinkButton href={renderUrl(`/boards/${board.id}/design`, false)}>
              <IconLabel icon={<LayoutDashboard />}>Design</IconLabel>
            </LinkButton>
            <LinkButton href={renderUrl(`/boards/${board.id}/edit`, false)}>
              <IconLabel icon={<Edit />}>{t(labels.edit)}</IconLabel>
            </LinkButton>
          </>
        )}
      </Row>
    </PageHeader>
  );
}
