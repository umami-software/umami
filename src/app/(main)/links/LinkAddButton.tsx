import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { LinkEditForm } from './LinkEditForm';
import { LinksUpgradePlaceholder } from './LinksUpgradePlaceholder';

export function LinkAddButton({
  teamId,
  upgradeRequired = false,
}: {
  teamId?: string;
  upgradeRequired?: boolean;
}) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Plus />} label={t(labels.addLink)} variant="primary" width="600px">
      {({ close }) =>
        upgradeRequired ? (
          <LinksUpgradePlaceholder onClose={close} />
        ) : (
          <LinkEditForm teamId={teamId} onClose={close} />
        )
      }
    </DialogButton>
  );
}
