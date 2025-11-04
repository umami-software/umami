import { Edit } from '@/components/icons';
import { CohortEditForm } from '@/app/(main)/websites/[websiteId]/cohorts/CohortEditForm';
import { useMessages } from '@/components/hooks';
import { Filter } from '@/lib/types';
import { DialogButton } from '@/components/input/DialogButton';

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
    <DialogButton
      icon={<Edit />}
      variant="quiet"
      title={formatMessage(labels.cohort)}
      width="800px"
    >
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
    </DialogButton>
  );
}
