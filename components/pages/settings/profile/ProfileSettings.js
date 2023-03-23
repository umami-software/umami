import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ProfileDetails from './ProfileDetails';
import PasswordChangeButton from './PasswordChangeButton';
import useConfig from 'hooks/useConfig';
import useMessages from 'hooks/useMessages';

export default function ProfileSettings() {
  const { formatMessage, labels } = useMessages();
  const { cloudMode } = useConfig();

  return (
    <Page>
      <PageHeader title={formatMessage(labels.profile)}>
        {!cloudMode && <PasswordChangeButton />}
      </PageHeader>
      <ProfileDetails />
    </Page>
  );
}
