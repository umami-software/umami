'use client';
import { Column } from '@umami/react-zen';
import { UserSettings } from './UserSettings';
import { UserProvider } from './UserProvider';
import { UserHeader } from '@/app/(main)/admin/users/[userId]/UserHeader';
import { Panel } from '@/components/common/Panel';

export function UserPage({ userId }: { userId: string }) {
  return (
    <UserProvider userId={userId}>
      <Column gap="6">
        <UserHeader />
        <Panel>
          <UserSettings userId={userId} />
        </Panel>
      </Column>
    </UserProvider>
  );
}
