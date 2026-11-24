import { Column, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { UserEditForm } from './UserEditForm';
import { UserTwoFactorSettings } from './UserTwoFactorSettings';
import { UserWebsites } from './UserWebsites';

export function UserSettings({ userId }: { userId: string }) {
  const { t, labels } = useMessages();

  return (
    <Column gap="6">
      <Tabs>
        <TabsList>
          <TabsTrigger value="details">{t(labels.details)}</TabsTrigger>
          <TabsTrigger value="websites">{t(labels.websites)}</TabsTrigger>
          <TabsTrigger value="security">{t(labels.security)}</TabsTrigger>
        </TabsList>
        <TabsContent value="details" style={{ width: 500 }}>
          <UserEditForm userId={userId} />
        </TabsContent>
        <TabsContent value="websites">
          <UserWebsites userId={userId} />
        </TabsContent>
        <TabsContent value="security" style={{ width: 500 }}>
          <UserTwoFactorSettings userId={userId} />
        </TabsContent>
      </Tabs>
    </Column>
  );
}
