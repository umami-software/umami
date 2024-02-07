import { useLocale, useLogin, useMessages } from 'components/hooks';
import { useRouter } from 'next/navigation';
import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import { touch } from 'store/modified';
import TeamDeleteForm from './TeamLeaveForm';

export function TeamLeaveButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { dir } = useLocale();
  const { user } = useLogin();

  const handleLeave = async () => {
    touch('teams');
    router.push('/settings/teams');
  };

  return (
    <ModalTrigger>
      <Button variant="secondary">
        <Icon rotate={dir === 'rtl' ? 180 : 0}>
          <Icons.Logout />
        </Icon>
        <Text>{formatMessage(labels.leave)}</Text>
      </Button>
      <Modal title={formatMessage(labels.leaveTeam)}>
        {(close: () => void) => (
          <TeamDeleteForm
            teamId={teamId}
            userId={user.id}
            teamName={teamName}
            onSave={handleLeave}
            onClose={close}
          />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default TeamLeaveButton;
