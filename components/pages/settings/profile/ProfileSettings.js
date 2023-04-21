import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ProfileDetails from './ProfileDetails';
import useMessages from 'hooks/useMessages';

export function ProfileSettings() {
  const { formatMessage, labels } = useMessages();

  return (
    <Page>
      <PageHeader title={formatMessage(labels.profile)} />
      <ProfileDetails />
    </Page>
  );
}

export default ProfileSettings;
