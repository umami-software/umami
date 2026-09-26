import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PaymentProvidersEditForm } from './PaymentProvidersEditForm';

export function PaymentProvidersAddButton() {
  const { t, labels } = useMessages();

  return (
    <DialogButton
      icon={<Plus />}
      label={t(labels.addPaymentProvider)}
      variant="primary"
      width="500px"
    >
      {({ close }) => <PaymentProvidersEditForm onClose={close} />}
    </DialogButton>
  );
}
