'use client';
import { Column, DataColumn, DataTable, Heading, Loading } from '@umami/react-zen';
import type {
  InstallationInventory,
  InstallationRecords,
} from '@/app/api/admin/installation/contract';
import { ActionForm } from '@/components/common/ActionForm';
import { ActionList } from '@/components/common/ActionList';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { PageHeader } from '@/components/common/PageHeader';
import { useApi, useConfig, useLocale, useLoginQuery, useMessages } from '@/components/hooks';
import { VersionSetting } from './VersionSetting';

export function InstallationPage() {
  const { user } = useLoginQuery();
  const { settingsOverride } = useConfig();
  const { t, labels, messages } = useMessages();
  const { locale } = useLocale();
  const { get, useQuery } = useApi();
  const canViewInstallation = !!user && (settingsOverride || user.isAdmin);
  const inventory = useQuery<InstallationInventory>({
    queryKey: ['admin:installation', 'inventory', user?.id],
    queryFn: () => get('/admin/installation'),
    enabled: canViewInstallation,
  });
  const records = useQuery<InstallationRecords>({
    queryKey: ['admin:installation', 'records', user?.id],
    queryFn: () => get('/admin/installation', { section: 'records' }),
    enabled: canViewInstallation,
  });

  if (!canViewInstallation) {
    return null;
  }

  const isLoading = inventory.isLoading || records.isLoading;
  const metrics = [
    { name: t(labels.users), count: inventory.data?.users },
    { name: t(labels.teams), count: inventory.data?.teams },
    { name: t(labels.websites), count: inventory.data?.websites },
    { name: t(labels.events), count: records.data?.websiteEvents },
    { name: t(labels.sessions), count: records.data?.sessions },
  ];

  return (
    <Column>
      <PageHeader title={t(labels.installation)} titleSuffix={isLoading && <Loading size="sm" />} />
      <Column gap="6">
        <ActionList>
          <ActionForm label={t(labels.version)} description={t(messages.versionDescription)}>
            <VersionSetting />
          </ActionForm>
        </ActionList>
        <Column gap="3">
          <Heading id="record-counts" size="lg">
            {t(labels.recordCounts)}
          </Heading>
          {(inventory.error || records.error) && <ErrorMessage />}
          <DataTable data={metrics} aria-busy={isLoading} aria-labelledby="record-counts">
            <DataColumn id="name" label={t(labels.name)} />
            <DataColumn id="count" label={t(labels.count)} align="end">
              {({ count }: (typeof metrics)[number]) => count?.toLocaleString(locale) ?? '—'}
            </DataColumn>
          </DataTable>
        </Column>
      </Column>
    </Column>
  );
}
