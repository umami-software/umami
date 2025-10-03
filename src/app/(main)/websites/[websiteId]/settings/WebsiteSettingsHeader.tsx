import { PageHeader } from '@/components/common/PageHeader';
import { Globe } from '@/components/icons';
import { useWebsite } from '@/components/hooks';

export function WebsiteSettingsHeader() {
  const website = useWebsite();

  return <PageHeader title={website?.name} icon={<Globe />} />;
}
