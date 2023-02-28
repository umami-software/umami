import { useIntl } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ProfileDetails from './ProfileDetails';
import PasswordChangeButton from './PasswordChangeButton';
import { labels } from 'components/messages';
import useConfig from 'hooks/useConfig';

export default function ProfileSettings() {
  const { formatMessage } = useIntl();
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
