import { LinkButton } from '@/components/common/LinkButton';
import { useNavigation } from '@/components/hooks';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';

export function PixelEditButton({ pixelId }: { pixelId: string }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <LinkButton href={renderUrl(`/pixels/${pixelId}/edit`, false)} variant="quiet" aria-label={t(labels.edit)}>
      <Edit />
    </LinkButton>
  );
}
