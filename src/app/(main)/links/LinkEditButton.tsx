import { Icon } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { Edit } from '@/components/icons';

export function LinkEditButton({ linkId }: { linkId: string }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <LinkButton
      href={renderUrl(`/links/${linkId}/edit`, false)}
      aria-label={t(labels.edit)}
      variant="quiet"
    >
      <Icon>
        <Edit />
      </Icon>
    </LinkButton>
  );
}
