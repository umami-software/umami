import { Icon, Row, Text } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageHeader } from '@/components/common/PageHeader';
import { useBoard, useMessages, useNavigation, useWebsiteQuery } from '@/components/hooks';
import { Edit, Globe } from '@/components/icons';

export function BoardViewHeader() {
  const { board } = useBoard();
  const { renderUrl } = useNavigation();
  const { t, labels } = useMessages();
  const { data: website } = useWebsiteQuery(board?.parameters?.websiteId);

  return (
    <PageHeader title={board?.name} description={board?.description}>
      <Row alignItems="center" gap>
        {website?.name && (
          <Row padding borderRadius="full" backgroundColor="surface-base" border gap="2">
            <Icon>
              <Globe />
            </Icon>
            <Text size="sm">{website.name}</Text>
          </Row>
        )}
        <LinkButton href={renderUrl(`/boards/${board?.id}/edit`, false)}>
          <IconLabel icon={<Edit />}>{t(labels.edit)}</IconLabel>
        </LinkButton>
      </Row>
    </PageHeader>
  );
}
