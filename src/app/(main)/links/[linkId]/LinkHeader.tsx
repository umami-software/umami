import { useLink, useMessages, useSlug } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Icon, Text } from '@umami/react-zen';
import { ExternalLink } from '@/components/icons';
import { LinkButton } from '@/components/common/LinkButton';

export function LinkHeader() {
  const { formatMessage, labels } = useMessages();
  const { getSlugUrl } = useSlug('link');
  const link = useLink();

  return (
    <PageHeader title={link.name} description={link.url}>
      <LinkButton href={getSlugUrl(link.slug)}>
        <Icon>
          <ExternalLink />
        </Icon>
        <Text>{formatMessage(labels.view)}</Text>
      </LinkButton>
    </PageHeader>
  );
}
