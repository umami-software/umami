'use client';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { SectionHeader } from '@/components/common/SectionHeader';
import { PreferenceSettings } from './PreferenceSettings';

export function PreferencesPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.preferences)} />
      <PreferenceSettings />
    </Column>
  );
}
