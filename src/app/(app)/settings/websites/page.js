import WebsitesList from 'app/(app)/settings/websites/WebsitesList';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return <WebsitesList />;
}
