import { useLoginQuery, useMessages, useModified } from '@/components/hooks';
import { useRouter } from 'next/navigation';
import { Button, Icon, Icons, Modal, DialogTrigger, Dialog, Text } from '@umami/react-zen';
import { TeamLeaveForm } from './TeamLeaveForm';

export function TeamLeaveButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { user } = useLoginQuery();
  const { touch } = useModified();

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <DialogTrigger>
      <Button variant="secondary">
        <Icon>
          <Icons.Logout />
        </Icon>
        <Text>{formatMessage(labels.leave)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.leaveTeam)}>
          {({ close }) => (
            <TeamLeaveForm
              teamId={teamId}
              userId={user.id}
              teamName={teamName}
              onSave={handleLeave}
              onClose={close}
            />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
