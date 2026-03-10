import { Icon } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { Edit } from '@/components/icons';

export function BoardEditButton({ boardId }: { boardId: string }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <LinkButton
      href={renderUrl(`/boards/${boardId}/edit`)}
      title={t(labels.edit)}
      aria-label={t(labels.edit)}
      variant="quiet"
    >
      <Icon>
        <Edit />
      </Icon>
    </LinkButton>
  );
}
