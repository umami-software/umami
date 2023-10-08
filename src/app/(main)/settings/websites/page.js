import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return (
    <>
      <WebsitesHeader />
      <WebsitesDataTable />
    </>
  );
}
