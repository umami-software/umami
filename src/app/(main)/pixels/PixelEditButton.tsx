import { Icon } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useNavigation } from '@/components/hooks';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';

export function PixelEditButton({ pixelId }: { pixelId: string }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <LinkButton
      href={renderUrl(`/pixels/${pixelId}/edit`, false)}
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
