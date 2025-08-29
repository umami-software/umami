import { ActionButton } from '@/components/input/ActionButton';
import { Edit } from '@/components/icons';
import { Dialog } from '@umami/react-zen';
import { CohortEditForm } from '@/app/(main)/websites/[websiteId]/cohorts/CohortEditForm';
import { useMessages } from '@/components/hooks';
import { Filter } from '@/lib/types';

export function CohortEditButton({
  cohortId,
  websiteId,
  filters,
}: {
  cohortId: string;
  websiteId: string;
  filters: Filter[];
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.cohort)} style={{ width: 800, minHeight: 300 }}>
        {({ close }) => {
          return (
            <CohortEditForm
              cohortId={cohortId}
              websiteId={websiteId}
              filters={filters}
              onClose={close}
            />
          );
        }}
      </Dialog>
    </ActionButton>
  );
}
