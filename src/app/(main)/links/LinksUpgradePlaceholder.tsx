import { Button, Column, Row } from '@umami/react-zen';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages } from '@/components/hooks';
import { Link } from '@/components/icons';

/**
 * Pass onClose when shown in a dialog: the buttons move to a bottom-right footer with Cancel,
 * like the link form, and Upgrade closes the dialog too.
 */
export function LinksUpgradePlaceholder({ onClose }: { onClose?: () => void }) {
  const { t, labels, messages } = useMessages();

  const handleUpgrade = () => {
    window.open(`${process.env.cloudUrl}/settings/billing`, '_blank');
    onClose?.();
  };

  const upgradeButton = (
    <Button variant="primary" onPress={handleUpgrade}>
      {t(labels.upgrade)}
    </Button>
  );

  if (!onClose) {
    return (
      <EmptyPlaceholder icon={<Link />} title={t(messages.upgradeRequired, { plan: 'Pro' })}>
        {upgradeButton}
      </EmptyPlaceholder>
    );
  }

  return (
    <Column>
      <EmptyPlaceholder icon={<Link />} title={t(messages.upgradeRequired, { plan: 'Pro' })} />
      <Row justifyContent="flex-end" paddingTop="8" gap="3">
        <Button onPress={onClose}>{t(labels.cancel)}</Button>
        {upgradeButton}
      </Row>
    </Column>
  );
}
