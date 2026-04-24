import { Row } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation, usePixel, useSlug } from '@/components/hooks';
import { Edit, ExternalLink, Grid2x2 } from '@/components/icons';

export function PixelHeader({ showActions = true }: { showActions?: boolean }) {
  const pixel = usePixel();

  return (
    <PageHeader title={pixel.name} icon={<Grid2x2 />}>
      {showActions && pixel.id && <PixelHeaderActions pixelId={pixel.id} slug={pixel.slug} />}
    </PageHeader>
  );
}

function PixelHeaderActions({ pixelId, slug }: { pixelId: string; slug: string }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('pixel');

  return (
    <Row alignItems="center" gap="3">
      <LinkButton href={renderUrl(`/pixels/${pixelId}/edit`, false)}>
        <IconLabel icon={<Edit />} label={t(labels.edit)} />
      </LinkButton>
      <LinkButton href={getSlugUrl(slug)} target="_blank" prefetch={false} asAnchor>
        <IconLabel icon={<ExternalLink />} label={t(labels.view)} />
      </LinkButton>
    </Row>
  );
}
