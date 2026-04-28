import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation } from '@/components/hooks';
import { LayoutDashboard } from '@/components/icons';

export function DashboardViewHeader() {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <PageHeader title={t(labels.dashboard)}>
      <LinkButton href={renderUrl('/dashboard/edit', false)}>
        <IconLabel icon={<LayoutDashboard />}>Design</IconLabel>
      </LinkButton>
    </PageHeader>
  );
}
