import { useMessages, useNavigation } from '@/components/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { WebsiteAddButton } from './WebsiteAddButton';

export interface WebsitesHeaderProps {
  allowCreate?: boolean;
}

export function WebsitesHeader({ allowCreate = true }: WebsitesHeaderProps) {
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();

  return (
    <PageHeader title={formatMessage(labels.websites)}>
      {allowCreate && <WebsiteAddButton teamId={teamId} />}
    </PageHeader>
  );
}
