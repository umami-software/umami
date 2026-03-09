import { Row } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageHeader } from '@/components/common/PageHeader';
import { useLink, useMessages, useSlug } from '@/components/hooks';
import { ExternalLink, Link } from '@/components/icons';
import { LinkShareButton } from './LinkShareButton';

export function LinkHeader({ showActions = true }: { showActions?: boolean }) {
  const link = useLink();

  return (
    <PageHeader title={link.name} description={link.url} icon={<Link />}>
      {showActions && link.id && <LinkHeaderActions linkId={link.id} slug={link.slug} />}
    </PageHeader>
  );
}

function LinkHeaderActions({ linkId, slug }: { linkId: string; slug: string }) {
  const { t, labels } = useMessages();
  const { getSlugUrl } = useSlug('link');

  return (
    <Row alignItems="center" gap="3">
      <LinkShareButton linkId={linkId} />
      <LinkButton href={getSlugUrl(slug)} target="_blank" prefetch={false} asAnchor>
        <IconLabel icon={<ExternalLink />} label={t(labels.view)} />
      </LinkButton>
    </Row>
  );
}
