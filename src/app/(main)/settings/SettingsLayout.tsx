'use client';
import { Column } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { PageBody } from '@/components/common/PageBody';

export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Column gap="6" margin="2" width="100%">
      <PageBody>{children}</PageBody>
    </Column>
  );
}
