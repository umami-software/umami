import { useIntl } from 'react-intl';
import { Button, Icon, Text, useToast, ModalTrigger } from 'react-basics';
import PasswordEditForm from 'components/pages/settings/profile/PasswordEditForm';
import { Lock } from 'components/icons';
import { labels, messages } from 'components/messages';

export default function PasswordChangeButton() {
  const { formatMessage } = useIntl();
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
      {toast}
      <ModalTrigger modalProps={{ title: formatMessage(labels.changePassword) }}>
        <Button>
          <Icon>
            <Lock />
          </Icon>
          <Text>{formatMessage(labels.changePassword)}</Text>
        </Button>
        {close => <PasswordEditForm onSave={handleSave} onClose={close} />}
      </ModalTrigger>
    </>
  );
}
