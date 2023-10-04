import WebsitesDataTable from './WebsitesDataTable';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return <WebsitesDataTable />;
}
