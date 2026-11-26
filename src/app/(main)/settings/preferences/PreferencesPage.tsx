'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';
import { PreferenceSettings } from './PreferenceSettings';

export function PreferencesPage() {
  const { t, labels } = useMessages();

  return (
    <Column>
      <PageHeader title={t(labels.preferences)} />
      <PreferenceSettings />
    </Column>
  );
}
