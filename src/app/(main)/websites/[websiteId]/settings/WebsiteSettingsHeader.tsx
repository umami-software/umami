import { useContext } from 'react';
import { WebsiteContext } from '@/app/(main)/websites/WebsiteProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Globe } from '@/components/icons';

export function WebsiteSettingsHeader() {
  const website = useContext(WebsiteContext);

  return <PageHeader title={website?.name} icon={<Globe />} />;
}
