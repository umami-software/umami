'use client';
import { Column } from '@umami/react-zen';
import { LinksDataTable } from '@/app/(main)/links/LinksDataTable';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import {
  useLinksQuery,
  useLoginQuery,
  useMessages,
  useNavigation,
  useSubscription,
  useTeamMembersQuery,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { LinkAddButton } from './LinkAddButton';
import { LinksUpgradePlaceholder } from './LinksUpgradePlaceholder';

export function LinksPage() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();
  const { teamId, query } = useNavigation();
  const { data } = useTeamMembersQuery(teamId);
  const { hasFeature, isLoading } = useSubscription(teamId);
  // Same query as LinksDataTable, so this shares its request rather than adding one.
  const { data: links } = useLinksQuery({ teamId });

  const upgradeRequired = !isLoading && !hasFeature('links');
  // Plans without links keep the ones they already have; only an empty list becomes the
  // upgrade prompt. A search with no matches still shows the table.
  const showUpgrade = upgradeRequired && !query.search && links?.count === 0;

  const showActions =
    (teamId &&
      data?.data.filter(team => team.userId === user.id && team.role !== ROLES.teamViewOnly)
        .length > 0) ||
    (!teamId && user.role !== ROLES.viewOnly);

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={t(labels.links)}>
          {showActions && user.role !== ROLES.viewOnly && !isLoading && !showUpgrade && (
            <LinkAddButton teamId={teamId} upgradeRequired={upgradeRequired} />
          )}
        </PageHeader>
        <Panel>
          {showUpgrade ? <LinksUpgradePlaceholder /> : <LinksDataTable showActions={showActions} />}
        </Panel>
      </Column>
    </PageBody>
  );
}
