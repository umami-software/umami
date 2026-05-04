import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { BillingsEditForm } from './BillingsEditForm';

export function BillingsAddButton() {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Plus />} label={t(labels.addBillingProvider)} variant="primary" width="500px">
      {({ close }) => <BillingsEditForm onClose={close} />}
    </DialogButton>
  );
}
