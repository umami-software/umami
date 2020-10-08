import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Page from '../layout/Page';
import PageHeader from '../layout/PageHeader';
import useFetch from '../../hooks/useFetch';
import DropDown from '../common/DropDown';
import RealtimeChart from '../metrics/RealtimeChart';

export default function TestConsole() {
  const user = useSelector(state => state.user);
  const [website, setWebsite] = useState();
  const { data } = useFetch('/api/websites');

  if (!data || !user?.is_admin) {
    return null;
  }

  const options = [{ label: 'All websites', value: 0 }].concat(
    data.map(({ name, website_id }) => ({ label: name, value: website_id })),
  );
  const selectedValue = options.find(({ value }) => value === website?.website_id)?.value || 0;

  function handleSelect(value) {
    setWebsite(data.find(({ website_id }) => website_id === value));
  }

  return (
    <Page>
      <PageHeader>
        <div>Real time</div>
        <DropDown value={selectedValue} options={options} onChange={handleSelect} />
      </PageHeader>
      <RealtimeChart websiteId={website?.website_id} />
    </Page>
  );
}
