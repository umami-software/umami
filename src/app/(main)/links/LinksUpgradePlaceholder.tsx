import { Button, Column, DialogFooter } from '@umami/react-zen';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages } from '@/components/hooks';
import { Link } from '@/components/icons';

/**
 * Pass onClose when shown in a dialog: the buttons move to the dialog footer with Cancel,
 * and Upgrade closes the dialog too.
 */
export function LinksUpgradePlaceholder({ onClose }: { onClose?: () => void }) {
  const { t, labels, messages } = useMessages();

  const handleUpgrade = () => {
    window.open(`${process.env.cloudUrl}/settings/billing`, '_blank');
    onClose?.();
  };

  const upgradeButton = <Button onClick={handleUpgrade}>{t(labels.upgrade)}</Button>;

  if (!onClose) {
    return (
      <EmptyPlaceholder icon={<Link />} title={t(messages.upgradeRequired, { plan: 'Pro' })}>
        {upgradeButton}
      </EmptyPlaceholder>
    );
  }

  return (
    <Column gap="6">
      <EmptyPlaceholder icon={<Link />} title={t(messages.upgradeRequired, { plan: 'Pro' })} />
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        {upgradeButton}
      </DialogFooter>
    </Column>
  );
}
