import { Icon } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useNavigation } from '@/components/hooks';
import { LayoutDashboard } from '@/components/icons';

export function BoardDesignButton({ boardId }: { boardId: string }) {
  const { renderUrl } = useNavigation();

  return (
    <LinkButton href={renderUrl(`/boards/${boardId}/design`)} aria-label="Design" variant="quiet">
      <Icon>
        <LayoutDashboard />
      </Icon>
    </LinkButton>
  );
}
