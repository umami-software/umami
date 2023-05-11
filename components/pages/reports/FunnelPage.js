import Page from 'components/layout/Page';
import FunnelChart from './FunnelChart';
import FunnelForm from './FunnelForm';

export default function FunnelPage() {
  function handleOnSearch() {
    // do API CALL to api/reports/funnel to get funnelData
    // Get DATA
  }

  return (
    <Page>
      funnelPage
      {/* <ReportForm /> */}
      <FunnelForm onSearchClick={handleOnSearch} /> website / start/endDate urls: []
      <FunnelChart />
      {/* {!chartLoaded && <Loading icon="dots" style={{ minHeight: 300 }} />}
      {chartLoaded && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} />}
          {view && <WebsiteMenuView websiteId={websiteId} />}
        </>
      )} */}
    </Page>
  );
}
