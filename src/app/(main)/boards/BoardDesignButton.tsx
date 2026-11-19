import { Icon } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { LayoutDashboard } from '@/components/icons';

export function BoardDesignButton({ boardId }: { boardId: string }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <LinkButton
      href={renderUrl(`/boards/${boardId}/design`)}
      aria-label={t(labels.design)}
      variant="quiet"
    >
      <Icon>
        <LayoutDashboard />
      </Icon>
    </LinkButton>
  );
}
