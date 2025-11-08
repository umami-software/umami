import { useLink, useMessages, useSlug } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Icon, Text } from '@umami/react-zen';
import { ExternalLink, Link } from '@/components/icons';
import { LinkButton } from '@/components/common/LinkButton';

export function LinkHeader() {
  const { formatMessage, labels } = useMessages();
  const { getSlugUrl } = useSlug('link');
  const link = useLink();

  return (
    <PageHeader title={link.name} description={link.url} icon={<Link />} marginBottom="3">
      <LinkButton href={getSlugUrl(link.slug)} target="_blank">
        <Icon>
          <ExternalLink />
        </Icon>
        <Text>{formatMessage(labels.view)}</Text>
      </LinkButton>
    </PageHeader>
  );
}
